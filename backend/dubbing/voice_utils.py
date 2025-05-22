import torch
from TTS.api import TTS
import logging
import os
from TTS.tts.configs.xtts_config import XttsConfig

logger = logging.getLogger(__name__)

def synthesize_tamil_audio(text, output_path, reference_audio=None):
    """Synthesize Tamil audio from text using XTTS model"""
    try:
        # Add XTTS config to safe globals
        torch.serialization.add_safe_globals([XttsConfig])
        
        model_name = "tts_models/multilingual/multi-dataset/xtts_v2"
        logger.info(f"Initializing TTS model: {model_name}")
        
        # Create output directory
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Initialize TTS with weights_only=False for compatibility
        tts = TTS(model_name, progress_bar=True)
        
        logger.info("Generating Tamil audio...")
        tts.tts_to_file(
            text=text,
            speaker_wav=reference_audio,
            language="ta",
            file_path=output_path
        )
        
        if not os.path.exists(output_path):
            raise FileNotFoundError(f"TTS failed to create output file: {output_path}")
            
        logger.info(f"Successfully generated Tamil audio at: {output_path}")
        return True
        
    except Exception as e:
        logger.error(f"TTS error: {str(e)}")
        raise