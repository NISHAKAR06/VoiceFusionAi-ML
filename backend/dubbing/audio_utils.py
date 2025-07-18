import subprocess
import os
import logging
import torch
import whisper
import numpy as np
import wave
from pathlib import Path

logger = logging.getLogger(__name__)

def extract_audio_ffmpeg(video_path, audio_path):
    """Extract audio from video using FFmpeg"""
    try:
        # Ensure paths are absolute
        video_path = str(Path(video_path).resolve())
        audio_path = str(Path(audio_path).resolve())

        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(audio_path), exist_ok=True)

        # Check if FFmpeg is available
        try:
            subprocess.run(['ffmpeg', '-version'], capture_output=True, check=True)
        except subprocess.CalledProcessError:
            raise RuntimeError("FFmpeg is not installed or not in PATH")

        # Construct FFmpeg command
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

        logger.info(f"Executing FFmpeg command: {' '.join(command)}")

        # Run FFmpeg
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=True
        )

        if os.path.exists(audio_path):
            logger.info(f"Successfully extracted audio to: {audio_path}")
            return True
        else:
            raise FileNotFoundError(f"FFmpeg did not create output file: {audio_path}")

    except subprocess.CalledProcessError as e:
        logger.error(f"FFmpeg error: {e.stderr}")
        raise RuntimeError(f"FFmpeg failed: {e.stderr}")
    except Exception as e:
        logger.error(f"Error extracting audio: {str(e)}")
        raise

def transcribe_audio_with_whisper(audio_path):
    """Transcribe audio using Whisper with optimized settings"""
    try:
        # If audio_path is a Path, convert to str
        if isinstance(audio_path, Path):
            audio_path = str(audio_path)
        logger.info(f"Transcribing audio ({type(audio_path)}): {audio_path}")

        if not np.__version__:
            raise ImportError("NumPy is not properly installed")

        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {device}")

        model = whisper.load_model(
            "tiny.en",
            device=device,
            download_root=os.path.join(os.path.dirname(__file__), "models")
        )

        # Transcribe with optimized settings
        result = model.transcribe(
            audio_path,
            fp16=False,
            language='en',
            task='transcribe',
            verbose=True
        )

        logger.info("Transcription completed successfully")
        return result["text"]

    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
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

def inspect_audio_properties(reference_audio):
    """Inspect audio properties using wave module"""
    try:
        # FIX: Convert Path to string
        with wave.open(str(reference_audio), 'rb') as wf:
            channels = wf.getnchannels()
            framerate = wf.getframerate()
            sampwidth = wf.getsampwidth()
            nframes = wf.getnframes()
        
        logger.info(f"Audio properties - Channels: {channels}, Frame rate: {framerate}, Sample width: {sampwidth}, Number of frames: {nframes}")
        return {
            "channels": channels,
            "framerate": framerate,
            "sampwidth": sampwidth,
            "nframes": nframes
        }

    except Exception as e:
        logger.error(f"Error inspecting audio properties: {str(e)}")
        raise
