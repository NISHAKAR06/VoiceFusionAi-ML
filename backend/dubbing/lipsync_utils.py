import subprocess

def run_wav2lip(video_path, audio_path, output_path):
    cmd = [
        "python", "/path/to/Wav2Lip/inference.py",
        "--checkpoint_path", "/path/to/Wav2Lip/checkpoints/wav2lip_gan.pth",
        "--face", video_path,
        "--audio", audio_path,
        "--outfile", output_path
    ]
    subprocess.run(cmd, check=True)