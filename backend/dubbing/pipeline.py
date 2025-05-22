import os
import shutil
from django.apps import apps
from .audio_utils import extract_audio_ffmpeg, transcribe_audio_with_whisper, replace_audio_in_video
from .translation_utils import translate_text_to_tamil
from .voice_utils import synthesize_tamil_audio
from .lipsync_utils import run_wav2lip
from .checks import run_all_checks
import logging

logger = logging.getLogger(__name__)

def cleanup_temp_files(*files):
    """Clean up temporary files after processing"""
    for file in files:
        try:
            if os.path.exists(file):
                os.remove(file)
                logger.info(f"Cleaned up temporary file: {file}")
        except Exception as e:
            logger.warning(f"Failed to clean up file {file}: {str(e)}")

def dubbing_pipeline(video_path, job_id):
    """Main dubbing pipeline that processes the video"""
    DubbingJob = apps.get_model('dubbing', 'DubbingJob')
    job = DubbingJob.objects.get(id=job_id)
    temp_files = []
    
    try:
        # Run all critical checks before processing
        run_all_checks(video_path)
        
        # Update job status to processing
        job.status = 'processing'
        job.progress = 0
        job.save()
        
        # Generate output paths
        base_dir = os.path.dirname(video_path)
        filename = os.path.basename(video_path)
        base_name = os.path.splitext(filename)[0]
        
        # Define all output paths
        extracted_audio_path = os.path.join(base_dir, f"{base_name}_extracted_audio.wav")
        translated_audio_path = os.path.join(base_dir, f"{base_name}_tamil_audio.wav")
        final_output_path = os.path.join(base_dir, f"{base_name}_dubbed.mp4")

        # Add files to cleanup list
        temp_files.extend([extracted_audio_path, translated_audio_path])

        logger.info(f"Starting dubbing pipeline for job {job_id}")

        # Step 1: Extract audio from video
        logger.info("Extracting audio from video...")
        extract_audio_ffmpeg(video_path, extracted_audio_path)
        
        # After extracting audio, check its quality
        run_all_checks(video_path, extracted_audio_path)
        
        job.progress = 20
        job.save()

        # Step 2: Speech recognition with sub-progress
        logger.info("Performing speech recognition...")
        job.status = 'processing'
        job.progress = 30
        job.save()
        
        english_text = transcribe_audio_with_whisper(extracted_audio_path)
        
        job.progress = 40
        job.save()

        # Step 3: Translation
        logger.info("Translating text to Tamil...")
        tamil_text = translate_text_to_tamil(english_text)
        job.progress = 60
        job.save()

        # Step 4: Voice synthesis
        logger.info("Synthesizing Tamil voice...")
        synthesize_tamil_audio(
            text=tamil_text,
            output_path=translated_audio_path,
            reference_audio=extracted_audio_path
        )
        job.progress = 80
        job.save()

        # Step 5: Lip sync and final video processing
        logger.info("Processing final video with lip sync...")
        run_wav2lip(
            video_path=video_path,
            audio_path=translated_audio_path,
            output_path=final_output_path
        )
        
        # Verify final output exists
        if not os.path.exists(final_output_path):
            raise FileNotFoundError(f"Final output video not created: {final_output_path}")
        
        # Save the result file path
        job.result_file = final_output_path
        job.progress = 100
        job.status = 'completed'
        job.save()

        logger.info(f"Dubbing pipeline completed for job {job_id}")

        # Cleanup temporary files
        cleanup_temp_files(*temp_files)

        return final_output_path
        
    except Exception as e:
        logger.error(f"Error in dubbing pipeline for job {job_id}: {str(e)}")
        # Update job status
        job.status = 'failed'
        job.error_message = str(e)
        job.save()
        # Attempt cleanup even on failure
        cleanup_temp_files(*temp_files)
        raise