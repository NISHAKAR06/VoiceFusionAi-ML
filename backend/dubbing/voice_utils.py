import torch
from TTS.api import TTS
import logging
import os
from pathlib import Path
import gc

logger = logging.getLogger(__name__)

from TTS.tts.configs.xtts_config import XttsConfig
from TTS.tts.configs.shared_configs import BaseTTSConfig
from coqpit import Coqpit
import torch.serialization

def synthesize_hindi_audio(text, output_path, reference_audio=None):
    """Synthesize Hindi audio from text using a Hindi-supported Coqui TTS model and clone the original voice."""
    try:
        import gc
        gc.collect()
        import torch
        
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
            use_cuda = True
        else:
            use_cuda = False

        from TTS.api import TTS
        model_name = "tts_models/multilingual/multi-dataset/xtts_v2"
        tts = TTS(model_name=model_name, progress_bar=True, gpu=use_cuda)

        if not reference_audio or not os.path.exists(reference_audio):
            raise ValueError("Reference audio is required for voice cloning.")

        logger.info(f"Calling tts_to_file with speaker='user', speaker_wav='{reference_audio}', language='hi'")
        logger.info(f"TTS args: text={text[:30]}, file_path={output_path}, language='hi', speaker='user', speaker_wav={reference_audio}")

        tts.tts_to_file(
            text=text,
            file_path=output_path,
            language="hi",
            # speaker="user",              # Must be a string, can be any name
            speaker_wav=reference_audio  # Path to reference audio
        )

        if not os.path.exists(output_path):
            raise FileNotFoundError(f"TTS failed to create output file: {output_path}")

        return True

    except Exception as e:
        logger.error(f"TTS error: {str(e)}")
        if os.path.exists(output_path):
            try:
                os.remove(output_path)
            except Exception as cleanup_error:
                logger.error(f"Failed to cleanup: {cleanup_error}")
        raise