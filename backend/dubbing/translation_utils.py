import logging
from typing import Optional
from googletrans import Translator
from translate import Translator as BackupTranslator
import requests
import time
from urllib3.util.retry import Retry
from requests.adapters import HTTPAdapter

logger = logging.getLogger(__name__)

# ...existing code...

class TranslationService:
    def __init__(self):
        # Configure session with retries
        self.session = requests.Session()
        retries = Retry(
            total=5,
            backoff_factor=0.1,
            status_forcelist=[500, 502, 503, 504]
        )
        self.session.mount('https://', HTTPAdapter(max_retries=retries))
        self.primary_translator = Translator(service_urls=[
            'translate.google.com',
            'translate.google.co.in',
            'translate.google.co.uk'
        ])
        self.backup_translator = BackupTranslator(to_lang="hi")  # <-- changed to Hindi

    def translate_with_primary(self, text: str) -> Optional[str]:
        try:
            result = self.primary_translator.translate(text, dest='hi')  # <-- changed to Hindi
            return result.text
        except Exception as e:
            logger.warning(f"Primary translation failed: {str(e)}")
            return None

    def translate_with_backup(self, text: str) -> Optional[str]:
        try:
            # Split text into smaller chunks to handle length limits
            max_chunk_size = 500
            chunks = [text[i:i + max_chunk_size] for i in range(0, len(text), max_chunk_size)]
            
            translated_chunks = []
            for chunk in chunks:
                translated = self.backup_translator.translate(chunk)
                translated_chunks.append(translated)
                time.sleep(0.5)  # Rate limiting
                
            return ' '.join(translated_chunks)
        except Exception as e:
            logger.warning(f"Backup translation failed: {str(e)}")
            return None

def translate_text_to_hindi(text: str, max_retries: int = 3) -> str:
    """
    Translate English text to Hindi with fallback mechanisms
    """
    service = TranslationService()
    
    for attempt in range(max_retries):
        try:
            logger.info(f"Translation attempt {attempt + 1}/{max_retries}")
            
            # Try primary translation service
            result = service.translate_with_primary(text)
            if result:
                logger.info("Primary translation successful")
                return result
                
            # Try backup translation service
            result = service.translate_with_backup(text)
            if result:
                logger.info("Backup translation successful")
                return result
                
            # If both failed, wait before retry
            time.sleep(1 * (attempt + 1))
            
        except Exception as e:
            logger.error(f"Translation attempt {attempt + 1} failed: {str(e)}")
            if attempt == max_retries - 1:
                raise
            time.sleep(1 * (attempt + 1))
            
    raise ConnectionError("All translation attempts failed")

