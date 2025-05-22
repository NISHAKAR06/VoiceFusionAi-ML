import subprocess
import os
import whisper
import torch
from pathlib import Path

def extract_audio_ffmpeg(video_path, audio_path):
    """Extract audio from video using FFmpeg"""
    try:
        os.makedirs(os.path.dirname(audio_path), exist_ok=True)
        
        command = [
            'ffmpeg',
            '-i', video_path,
            '-vn',
            '-acodec', 'pcm_s16le',
            '-ar', '44100',
            '-ac', '2',
            '-y',
            audio_path
        ]
        
        print(f"Extracting audio from: {video_path}")
        print(f"Output audio path: {audio_path}")
        
        result = subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True
        )
        
        if not os.path.exists(audio_path):
            raise Exception(f"Audio extraction failed. Output file not created: {audio_path}")
            
        return True
        
    except Exception as e:
        print(f"Error extracting audio: {str(e)}")
        raise

def transcribe_audio_with_whisper(audio_path):
    """Transcribe audio using Whisper with GPU acceleration"""
    try:
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(f"Using device: {device} ({torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'})")

        model = whisper.load_model(
            "medium",
            device=device
        )
        
        print(f"Transcribing audio: {audio_path}")
        result = model.transcribe(
            audio_path,
            fp16=True,
            language="en",
            task="transcribe"
        )
        
        return result["text"]
        
    except Exception as e:
        print(f"Error transcribing audio: {str(e)}")
        raise

def replace_audio_in_video(video_path, audio_path, output_path):
    """Replace audio in video using FFmpeg"""
    try:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        command = [
            'ffmpeg',
            '-i', video_path,
            '-i', audio_path,
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-map', '0:v:0',
            '-map', '1:a:0',
            '-y',
            output_path
        ]
        
        print(f"Replacing audio in: {video_path}")
        print(f"With audio from: {audio_path}")
        print(f"Output path: {output_path}")
        
        result = subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True
        )
        
        if not os.path.exists(output_path):
            raise Exception(f"Video creation failed. Output file not created: {output_path}")
            
        return True
        
    except Exception as e:
        print(f"Error replacing audio: {str(e)}")
        raise