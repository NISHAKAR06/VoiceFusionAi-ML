import subprocess

def extract_audio_ffmpeg(video_path, output_audio_path):
    command = ["ffmpeg", "-i", video_path, "-q:a", "0", "-map", "a", output_audio_path, "-y"]
    subprocess.run(command, check=True)

def transcribe_audio_with_whisper(audio_path):
    import whisper
    model = whisper.load_model("base", device="cpu")
    result = model.transcribe(audio_path)
    return result["text"]

def replace_audio_in_video(video_path, audio_path, output_path):
    command = [
        "ffmpeg", "-y",
        "-i", video_path,
        "-i", audio_path,
        "-c:v", "copy",
        "-map", "0:v:0",
        "-map", "1:a:0",
        "-shortest",
        output_path
    ]
    subprocess.run(command, check=True)