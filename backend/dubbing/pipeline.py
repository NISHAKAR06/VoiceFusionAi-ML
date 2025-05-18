from .audio_utils import extract_audio_ffmpeg, transcribe_audio_with_whisper, replace_audio_in_video
from .translation_utils import translate_text_to_tamil
from .voice_utils import synthesize_tamil_audio
from .lipsync_utils import run_wav2lip
import os

def dubbing_pipeline(video_path):
    base_dir = os.path.dirname(video_path)
    audio_path = os.path.join(base_dir, "extracted_audio.wav")
    tamil_audio_path = os.path.join(base_dir, "tamil_audio.wav")
    temp_video_path = os.path.join(base_dir, "temp_video.mp4")
    final_video_path = os.path.join(base_dir, "final_dubbed.mp4")

    # 1. Extract audio
    extract_audio_ffmpeg(video_path, audio_path)

    # 2. Transcribe to English
    english_text = transcribe_audio_with_whisper(audio_path)

    # 3. Translate English to Tamil
    tamil_text = translate_text_to_tamil(english_text)

    # 4. Synthesize Tamil audio (voice cloning)
    synthesize_tamil_audio(tamil_text, tamil_audio_path, reference_audio=audio_path)

    # 5. Replace audio in video
    replace_audio_in_video(video_path, tamil_audio_path, temp_video_path)

    # 6. Lip sync
    run_wav2lip(temp_video_path, tamil_audio_path, final_video_path)

    # Optionally: Save final_video_path to DB or notify frontend
    return final_video_path