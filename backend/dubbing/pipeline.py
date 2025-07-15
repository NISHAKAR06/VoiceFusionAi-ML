import os
import logging
import time
from pathlib import Path
from django.apps import apps
from .audio_utils import extract_audio_ffmpeg, transcribe_audio_with_whisper, inspect_audio_properties
from .translation_utils import translate_text_to_hindi
from .voice_utils import synthesize_hindi_audio
from .lipsync_utils import run_wav2lip
from .checks import run_all_checks
import traceback

logger = logging.getLogger(__name__)

MEDIA_ROOT = Path(__file__).parent.parent / "media"

def cleanup_temp_files(*files):
    """Clean up temporary files after processing"""
    for file in files:
        try:
            if os.path.exists(file):
                os.remove(file)
                logger.info(f"Cleaned up temporary file: {file}")
        except Exception as e:
            logger.warning(f"Failed to clean up file {file}: {str(e)}")

def ensure_dir(path):
    Path(path).parent.mkdir(parents=True, exist_ok=True)

def update_step(job, step_id, status, progress_percent, callback=None):
    if job.step_status is None:
        job.step_status = {}
    job.step_status[step_id] = {"status": status, "progress": progress_percent}
    
    # Update overall progress
    total_progress = sum(step.get('progress', 0) for step in job.step_status.values())
    job.progress = total_progress / len(job.step_status)
    
    job.save(update_fields=["step_status", "progress"])
    if callback:
        callback(step_id, status, progress_percent)

def dubbing_pipeline(video_path, job_id, progress_callback=None):
    DubbingJob = apps.get_model('dubbing', 'DubbingJob')
    job = DubbingJob.objects.get(id=job_id)
    base_name = Path(video_path).stem

    # Define all output paths in their respective folders
    extracted_audio_path = MEDIA_ROOT / "audio" / f"{base_name}_extracted.wav"
    hindi_audio_path = MEDIA_ROOT / "audio" / f"{base_name}_hindi.wav"
    final_output_path = MEDIA_ROOT / "results" / f"{base_name}_dubbed.mp4"

    # Ensure directories exist
    for p in [extracted_audio_path, hindi_audio_path, final_output_path]:
        ensure_dir(p)

    temp_files = [extracted_audio_path, hindi_audio_path]

    # Set job status to processing at the start
    job.status = 'processing'
    job.progress = 0
    job.save(update_fields=["status", "progress"])

    try:
        logger.info("=== Starting full folder and resource check ===")
        # Run all critical checks (system, video, audio)
        run_all_checks(video_path)
        logger.info("All critical checks passed.")

        logger.info(f"Received video upload: {video_path}")

        # Step 1: Extract audio
        logger.info("Extracting audio from video...")
        update_step(job, "speech-recognition", "in-progress", 10, progress_callback)
        extract_audio_ffmpeg(video_path, extracted_audio_path)
        job.extracted_audio.name = str(Path("audio") / f"{base_name}_extracted.wav")
        job.save(update_fields=['extracted_audio'])
        update_step(job, "speech-recognition", "completed", 20, progress_callback)
        logger.info(f"Audio extracted and saved to: {extracted_audio_path}")

        # Step 2: Inspect audio
        logger.info("Inspecting audio properties...")
        update_step(job, "translation", "in-progress", 30, progress_callback)
        props = inspect_audio_properties(extracted_audio_path)
        logger.info(f"Audio properties: {props}")
        update_step(job, "translation", "completed", 40, progress_callback)

        # Step 3: Transcribe
        logger.info("Transcribing audio...")
        update_step(job, "voice-synthesis", "in-progress", 50, progress_callback)
        english_text = transcribe_audio_with_whisper(extracted_audio_path)
        update_step(job, "voice-synthesis", "completed", 60, progress_callback)
        logger.info("Transcription completed successfully")

        # Step 4: Translate
        logger.info("Translating text to Hindi...")
        update_step(job, "lip-sync", "in-progress", 70, progress_callback)
        hindi_text = translate_text_to_hindi(english_text)
        job.translated_subtitles = hindi_text
        job.save(update_fields=['translated_subtitles'])
        update_step(job, "lip-sync", "completed", 80, progress_callback)
        logger.info("="*40)
        logger.info(f"Translated Hindi text:\n{hindi_text}")
        logger.info("="*40)
        print(f"\n=== Translated Hindi text ===\n{hindi_text}\n============================\n")

        # Step 5: Synthesize Hindi audio (voice cloning)
        logger.info("Synthesizing Hindi voice...")
        update_step(job, "processing", "in-progress", 90, progress_callback)
        props = inspect_audio_properties(extracted_audio_path)
        logger.info(f"Reference audio properties: {props}")
        synthesize_hindi_audio(
            text=hindi_text,
            output_path=hindi_audio_path,
            reference_audio=extracted_audio_path
        )
        update_step(job, "processing", "completed", 95, progress_callback)
        logger.info(f"Hindi audio synthesized and saved to {hindi_audio_path}")

        # Step 6: Lip sync
        logger.info("Running Wav2Lip for lip sync...")
        update_step(job, "lip-sync", "in-progress", 98, progress_callback)
        
        def wav2lip_progress_callback(progress):
            update_step(job, "lip-sync", "in-progress", 98 + (progress / 50), progress_callback) # 98 to 100
        try:
            run_wav2lip(video_path, hindi_audio_path, final_output_path, quality=job.quality, progress_callback=wav2lip_progress_callback)
            update_step(job, "lip-sync", "completed", 100, progress_callback)
            logger.info(f"Dubbed video created and saved to {final_output_path}")
        except Exception as e:
            logger.error(f"Wav2Lip failed: {e}")
            job.status = 'failed'
            job.error_message = f"Wav2Lip failed: {e}"
            job.save(update_fields=['status', 'error_message'])
            raise

        # Step 7: Cleanup
        cleanup_temp_files(*temp_files)
        logger.info("Temporary files cleaned up.")

        # Update job status
        rel_path = Path("results") / f"{Path(video_path).stem}_dubbed.mp4"
        job.result_file = str(rel_path)
        job.dubbed_audio_file.name = str(Path("audio") / f"{base_name}_hindi.wav")
        job.status = 'completed'
        job.save(update_fields=['status', 'result_file', 'dubbed_audio_file'])
        logger.info("=== Dubbing pipeline completed successfully ===")

        # Return status for frontend
        return {
            "status": "success",
            "result_file": str(final_output_path),
            "message": "Dubbing completed successfully."
        }

    except Exception as e:
        logger.error(f"Error in dubbing pipeline for job {job_id}: {str(e)}")
        logger.error(traceback.format_exc())
        cleanup_temp_files(*temp_files)
        job.status = 'failed'
        job.error_message = str(e)
        job.save(update_fields=['status', 'error_message'])
        return {
            "status": "failed",
            "error": str(e),
            "message": "Dubbing failed. Check logs for details."
        }
