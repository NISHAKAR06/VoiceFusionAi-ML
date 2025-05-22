from deep_translator import GoogleTranslator
import logging

logger = logging.getLogger(__name__)

def translate_text_to_tamil(text):
    try:
        # Split text into chunks if too long (Google Translate limit is 5000 chars)
        max_length = 4900
        if len(text) > max_length:
            chunks = [text[i:i+max_length] for i in range(0, len(text), max_length)]
            translated_chunks = []
            for chunk in chunks:
                translated_chunk = GoogleTranslator(source="en", target="ta").translate(chunk)
                translated_chunks.append(translated_chunk)
            return ' '.join(translated_chunks)
        else:
            return GoogleTranslator(source="en", target="ta").translate(text)
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        raise