from deep_translator import GoogleTranslator

def translate_text_to_tamil(text):
    return GoogleTranslator(source="en", target="ta").translate(text)