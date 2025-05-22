import subprocess
import json
import logging
import os
import torch
from pathlib import Path

logger = logging.getLogger(__name__)

# Configuration constants
ALLOWED_VIDEO_FORMATS = ['.mp4', '.avi', '.mov', '.mkv']
MAX_VIDEO_SIZE = 500 * 1024 * 1024  # 500MB
MIN_AUDIO_SAMPLE_RATE = 16000
MIN_AUDIO_BITRATE = 64000
MIN_MEMORY_REQUIRED = 4 * 1024 * 1024 * 1024  # 4GB
MIN_DISK_SPACE = 10 * 1024 * 1024 * 1024  # 10GB

def validate_video_format(video_path: str) -> bool:
    """Validate video format and size"""
    try:
        if not any(video_path.lower().endswith(fmt) for fmt in ALLOWED_VIDEO_FORMATS):
            raise ValueError(f"Unsupported video format. Allowed formats: {', '.join(ALLOWED_VIDEO_FORMATS)}")
        
        if os.path.getsize(video_path) > MAX_VIDEO_SIZE:
            raise ValueError(f"Video file too large. Maximum size: {MAX_VIDEO_SIZE/1024/1024}MB")
            
        return True
    except Exception as e:
        logger.error(f"Video validation failed: {str(e)}")
        raise

def validate_audio_quality(audio_path: str) -> bool:
    """Validate audio quality meets minimum requirements"""
    try:
        cmd = [
            'ffprobe',
            '-v', 'error',
            '-select_streams', 'a:0',
            '-show_entries', 'stream=bit_rate,sample_rate',
            '-of', 'json',
            audio_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        audio_info = json.loads(result.stdout)
        
        stream_info = audio_info.get('streams', [{}])[0]
        sample_rate = int(stream_info.get('sample_rate', 0))
        bit_rate = int(stream_info.get('bit_rate', 0))
        
        if sample_rate < MIN_AUDIO_SAMPLE_RATE:
            raise ValueError(f"Audio sample rate too low: {sample_rate}Hz (minimum: {MIN_AUDIO_SAMPLE_RATE}Hz)")
        if bit_rate < MIN_AUDIO_BITRATE:
            raise ValueError(f"Audio bitrate too low: {bit_rate/1000}kbps (minimum: {MIN_AUDIO_BITRATE/1000}kbps)")
            
        return True
    except Exception as e:
        logger.error(f"Audio quality check failed: {str(e)}")
        raise

# def check_system_resources() -> bool:
#     """Check if system has sufficient resources"""
#     try:
#         import psutil
        
#         # Check available memory
#         available_memory = psutil.virtual_memory().available
#         if available_memory < MIN_MEMORY_REQUIRED:
#             raise MemoryError(f"Insufficient memory. Available: {available_memory/1024/1024/1024:.1f}GB")
            
#         # Check disk space
#         disk_usage = psutil.disk_usage('/')
#         if disk_usage.free < MIN_DISK_SPACE:
#             raise OSError(f"Insufficient disk space. Available: {disk_usage.free/1024/1024/1024:.1f}GB")
            
#         return True
#     except Exception as e:
#         logger.error(f"System resource check failed: {str(e)}")
#         raise

def check_system_resources():
    """Check if system has sufficient resources for transcription"""
    try:
        import psutil
        
        # Check available memory (minimum 8GB recommended for Whisper)
        available_memory = psutil.virtual_memory().available
        min_required = 8 * 1024 * 1024 * 1024  # 8GB
        
        if available_memory < min_required:
            logger.warning(f"Low memory available: {available_memory/1024/1024/1024:.1f}GB")
            
        # Set torch to optimize for CPU if CUDA not available
        if not torch.cuda.is_available():
            torch.set_num_threads(psutil.cpu_count())
            logger.info(f"Using {psutil.cpu_count()} CPU threads")
            
        return True
    except Exception as e:
        logger.error(f"Resource check failed: {str(e)}")
        raise

def run_all_checks(video_path: str, audio_path: str = None) -> bool:
    """Run all critical checks before processing"""
    try:
        # Check system resources
        check_system_resources()
        
        # Validate video
        validate_video_format(video_path)
        
        # Validate audio if provided
        if audio_path and os.path.exists(audio_path):
            validate_audio_quality(audio_path)
            
        return True
    except Exception as e:
        logger.error(f"Critical checks failed: {str(e)}")
        raise