from TTS.api import TTS
import logging
import os

logger = logging.getLogger(__name__)

def synthesize_tamil_audio(text, output_path, reference_audio=None):
    try:
        model_name = "tts_models/multilingual/multi-dataset/xtts_v2"
        logger.info(f"Initializing TTS model: {model_name}")
        
        # Create output directory
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        tts = TTS(model_name)
        
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