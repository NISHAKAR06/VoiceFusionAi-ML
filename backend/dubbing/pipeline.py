from .audio_utils import extract_audio_ffmpeg, transcribe_audio_with_whisper, replace_audio_in_video
from .translation_utils import translate_text_to_tamil
from .voice_utils import synthesize_tamil_audio
from .lipsync_utils import run_wav2lip
import os


def dubbing_pipeline(video_path, job_id=None):
    from .models import DubbingJob

    job = DubbingJob.objects.get(id=job_id)
    base, _ = os.path.splitext(video_path)
    audio_path = base + "_audio.wav"
    tamil_audio_path = base + "_tamil.wav"
    temp_video_path = base + "_temp.mp4"

    try:
        job.status = 'processing'
        job.progress = 10
        job.save()

        extract_audio_ffmpeg(video_path, audio_path)
        job.progress = 30
        job.save()

        english_text = transcribe_audio_with_whisper(audio_path)
        job.progress = 50
        job.save()

        tamil_text = translate_text_to_tamil(english_text)
        job.progress = 60
        job.save()

        synthesize_tamil_audio(tamil_text, tamil_audio_path, reference_audio=audio_path)
        job.progress = 80
        job.save()

        # 5. (Optional) Lip sync
        run_wav2lip(video_path, tamil_audio_path, temp_video_path)
        job.progress = 90
        job.save()

        # 6. Replace audio in video
        output_video_path = base + "_dubbed.mp4"
        replace_audio_in_video(temp_video_path, tamil_audio_path, output_video_path)
        
        # Update job with result file
        from django.core.files import File
        job.result_file.save(
            os.path.basename(output_video_path),
            File(open(output_video_path, 'rb'))
        )
        
        job.status = 'completed'
        job.progress = 100
        job.save()

    except Exception as e:
        job.status = 'failed'
        job.error_message = str(e)
        job.save()
        raise
    return output_video_path