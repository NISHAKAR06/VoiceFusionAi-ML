import os
from pathlib import Path

def setup_directories():
    """Create all necessary directories for the dubbing pipeline"""
    # Get the base directory
    base_dir = Path(__file__).parent.parent
    
    # Define required directories
    directories = [
        base_dir / 'media' / 'videos',    # For uploaded videos
        base_dir / 'media' / 'audio',     # For extracted audio
        base_dir / 'media' / 'results',   # For final output
        base_dir / 'media' / 'temp'       # For temporary files
    ]
    
    # Create directories
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
        print(f"Created directory: {directory}")

if __name__ == "__main__":
    setup_directories()