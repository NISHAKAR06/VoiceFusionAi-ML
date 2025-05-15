from flask import Flask, request, jsonify
import os
from werkzeug.utils import secure_filename
from TTS.api import TTS
from transformers import MarianTokenizer, MarianMTModel, pipeline
from pydub import AudioSegment
import uuid
import tempfile
import whisper  # speech-to-text

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# TTS & Translation setup (same as before)
tts = TTS(model_name="tts_models/multilingual/multi-dataset/xtts_v2", gpu=True)
whisper_model = whisper.load_model("base")

tokenizer_ta_en = MarianTokenizer.from_pretrained("Helsinki-NLP/opus-mt-mul-en")
model_ta_en = MarianMTModel.from_pretrained("Helsinki-NLP/opus-mt-mul-en").to("cuda")
translator_ta_en = pipeline("translation", model=model_ta_en, tokenizer=tokenizer_ta_en, device=0)

tokenizer_en_hi = MarianTokenizer.from_pretrained("Helsinki-NLP/opus-mt-en-hi")
model_en_hi = MarianMTModel.from_pretrained("Helsinki-NLP/opus-mt-en-hi").to("cuda")
translator_en_hi = pipeline("translation", model=model_en_hi, tokenizer=tokenizer_en_hi, device=0)

SPEAKER_WAV = r"D:\VoiceFusion\backend\audio_processing\data\tamil_audio\output_clean.wav"
BASE_OUTPUT_DIR = r"D:\VoiceFusion\backend\audio_processing\data\dubbed_output"

@app.route('/upload-video', methods=['POST'])
def upload_video():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    save_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(save_path)

    # Convert video to audio (extract audio)
    audio_path = save_path.replace('.mp4', '.wav')
    os.system(f"ffmpeg -y -i \"{save_path}\" -ar 16000 -ac 1 -f wav \"{audio_path}\"")

    # Speech-to-text (Tamil)
    print("🔊 Running speech-to-text...")
    result = whisper_model.transcribe(audio_path, language='ta')
    tamil_lines = [result['text']]
    
    session_id = str(uuid.uuid4())[:8]
    output_dir = os.path.join(BASE_OUTPUT_DIR, session_id)
    os.makedirs(output_dir, exist_ok=True)

    for i, line in enumerate(tamil_lines, 1):
        en_text = translator_ta_en(line)[0]["translation_text"]
        hi_text = translator_en_hi(en_text)[0]["translation_text"]
        output_path = os.path.join(output_dir, f"line_{i:03d}.wav")
        tts.tts_to_file(
            text=hi_text,
            speaker_wav=SPEAKER_WAV,
            language="hi",
            file_path=output_path,
        )

    # Combine
    combined = AudioSegment.empty()
    for i in range(1, len(tamil_lines)+1):
        file_path = os.path.join(output_dir, f"line_{i:03d}.wav")
        combined += AudioSegment.from_wav(file_path) + AudioSegment.silent(duration=300)

    final_audio = os.path.join(output_dir, "dubbed_final.wav")
    combined.export(final_audio, format="wav")

    return jsonify({"status": "success", "dubbed_audio_path": final_audio})

if __name__ == '__main__':
    app.run(debug=True)
