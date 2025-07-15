import subprocess
import os
from pathlib import Path
import logging
import sys
import torch

logger = logging.getLogger(__name__)

def check_wav2lip_dependencies():
    """Check if all required Wav2Lip dependencies are available"""
    try:
        # Check CUDA availability
        cuda_available = torch.cuda.is_available()
        logger.info(f"CUDA available: {cuda_available}")

        # Check Wav2Lip installation
        wav2lip_path = os.getenv('WAV2LIP_PATH')
        if not wav2lip_path:
            raise EnvironmentError("WAV2LIP_PATH environment variable is not set")

        # Check model checkpoint
        checkpoint_path = os.path.join(wav2lip_path, r"C:\Users\NISHAKART\Documents\GitHub\VoiceFusionAi-ML\backend\Wav2Lip\checkpoints\wav2lip_gan.pth")
        if not os.path.exists(checkpoint_path):
            raise FileNotFoundError(f"Wav2Lip model checkpoint not found at: {checkpoint_path}")

        return True
    except Exception as e:
        logger.error(f"Wav2Lip dependency check failed: {str(e)}")
        raise

def run_wav2lip(video_path, audio_path, output_path, quality="medium", progress_callback=None):
    """Run Wav2Lip to synchronize lip movements with audio"""
    try:
        # Check dependencies first
        check_wav2lip_dependencies()

        # Ensure paths are absolute
        video_path = str(Path(video_path).resolve())
        audio_path = str(Path(audio_path).resolve())
        output_path = str(Path(output_path).resolve())
        
        # Create output directory if it doesn't exist
        output_dir = os.path.dirname(output_path)
        os.makedirs(output_dir, exist_ok=True)
        
        # Get Wav2Lip path from environment variable or use default
        wav2lip_path = os.getenv('WAV2LIP_PATH')
        if not wav2lip_path:
            raise EnvironmentError("WAV2LIP_PATH environment variable is not set")
        
        checkpoint_path = os.path.join(wav2lip_path, r"C:\Users\NISHAKART\Documents\GitHub\VoiceFusionAi-ML\backend\Wav2Lip\checkpoints\wav2lip_gan.pth")
        if not os.path.exists(checkpoint_path):
            raise FileNotFoundError(f"Wav2Lip checkpoint not found at: {checkpoint_path}")
        
        logger.info(f"Running Wav2Lip on video: {video_path}")
        logger.info(f"Using audio: {audio_path}")
        logger.info(f"Output will be saved to: {output_path}")
        
        cmd = [
            sys.executable,
            os.path.join(wav2lip_path, "inference.py"),
            "--checkpoint_path", checkpoint_path,
            "--face", video_path,
            "--audio", audio_path,
            "--outfile", output_path,
            "--wav2lip_batch_size", "16"
        ]

        if quality == "fast":
            cmd.extend(["--resize_factor", "2"])
        elif quality == "high":
            cmd.extend(["--pads", "0", "20", "0", "0"])
        else: # medium
            cmd.extend(["--nosmooth"])
        
        # Add detailed progress logging
        logger.info("Starting Wav2Lip processing...")

        # Force CPU usage to avoid GPU memory hangs
        env = os.environ.copy()
        env["CUDA_VISIBLE_DEVICES"] = ""
        logger.info("Forcing CPU for Wav2Lip to ensure stability.")

        process = subprocess.Popen(
            cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            env=env
        )
        
        # Monitor stdout for progress
        while True:
            output = process.stdout.readline()
            if output == '' and process.poll() is not None:
                break
            if output:
                logger.info(output.strip())
                # Example of parsing progress: "Processing frame 100/1000"
                if "Processing frame" in output:
                    parts = output.split()
                    try:
                        current_frame = int(parts[2].split('/')[0])
                        total_frames = int(parts[2].split('/')[1])
                        progress = int((current_frame / total_frames) * 100)
                        if progress_callback:
                            progress_callback(progress)
                    except (ValueError, IndexError):
                        pass
        
        # Check for errors
        stdout, stderr = process.communicate()
        if process.returncode != 0:
            logger.error(f"Wav2Lip output: {stdout}")
            if stderr:
                logger.error(f"Wav2Lip stderr: {stderr}")
            raise subprocess.CalledProcessError(process.returncode, cmd, stderr=stderr)

        if not os.path.exists(output_path):
            raise FileNotFoundError(f"Wav2Lip failed to create output file: {output_path}")
            
        logger.info("Wav2Lip processing completed successfully")
        return True
        
    except subprocess.CalledProcessError as e:
        error_msg = f"Wav2Lip process failed: {e.stderr}"
        logger.error(error_msg)
        raise RuntimeError(error_msg)
    except Exception as e:
        logger.error(f"Error in Wav2Lip processing: {str(e)}")
        raise
