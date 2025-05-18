from TTS.api import TTS

def synthesize_tamil_audio(text, output_path, reference_audio=None):
    tts = TTS("tts_models/multilingual/multi-dataset/xtts_v2")
    tts.tts_to_file(text=text, speaker_wav=reference_audio, language="ta", file_path=output_path)