# 🎥 VoiceFusionAi-ML
VoiceFusionAi-ML is an AI-powered system that automatically dubs English videos into Hindi, with realistic lip-syncing.
It extracts audio, transcribes the English speech, translates it into Hindi, and generates a lip-synced Hindi video — all through a web interface.

# 📖 Description
VoiceFusionAi-ML helps creators, educators, and businesses localize English videos for Hindi-speaking audiences.
By leveraging state-of-the-art AI models and tools, it automates transcription, translation, and lip-syncing — reducing manual effort and production time.

# 🌟 Features
## ✅ Transcribe English audio using Whisper (ASR)
- ✅ Translate text from English → Hindi using Deep Translator
- ✅ Generate realistic lip-sync with Wav2Lip
- ✅ Extract and merge audio/video using FFmpeg and MoviePy
- ✅ Web-based UI built with React + Vite + TypeScript
- ✅ Backend powered by Django REST framework
- ✅ Supports GPU acceleration with CUDA (optional)
- ✅ Conda-based environment for reproducibility
# 🎯 Applications
- 🎓 Education & E-learning: Tutorials, lectures, and training videos in Hindi

- 🎬 Entertainment & Media: Dubbing movies, reels, and social content

- 💼 Marketing & Corporate: Localized ads, explainers, and internal training videos

- 🌏 Accessibility: Making English content more accessible to Hindi audiences

# 🧰 Tech Stack

## Frontend
     React — Component-based UI

     Vite — Fast web build tool

     TypeScript — Typed JavaScript

     CSS/HTML — Styling & layout

## Backend

     Python — Core scripting language

     Django — Web backend & REST API

     Whisper — Automatic Speech Recognition (ASR)

     Deep Translator — English → Hindi translation

     FFmpeg — Audio/video extraction and merging

     MoviePy — Video editing

     Wav2Lip — Realistic lip-sync

     CUDA (compulsory for wav2lip) — GPU acceleration
     
## Folder Structure
```
VoiceFusionAi-ML/
├── backend/
│   ├── manage.py
│   ├── backend_manager/             # Django Settings
│   │   ├── settings.py
│   │   ├── urls.py
|   |   ├── celery.py
│   │   └── wsgi.py   
|   ├──dubbing                   # Django App
|   |   ├── lipsync_utils.py
│   |   ├── models.py
│   |   ├── english_to_hindi.py
│   │   ├── apps.py
│   |   ├── audio_utils.py
│   |   ├── voice_utils.py
│   │   ├── checks.py
│   |   ├── models
│   │   ├── urls.py
│   │   ├── pipeline.py
│   │   ├── views.py
│   │   ├── signals.py
│   │   ├── setup_directories.py
│   │   ├── task.py
│   │   ├── translation_utils.py
│   │   └── wav2lip.pth
│   ├──Wav2Lip                      # clone the folder in git ""https://github.com/Rudrabha/Wav2Lip.git""
│   ├── media/
│   └── requirements.txt
├── frontend/                      
│   ├── src/
│   │   ├── components/
|   |   ├── context/
|   |   ├── hooks/
|   |   ├── pages/
|   |   ├── lib/
|   |   ├── main.css
|   |   ├── App.css
│   │   ├── App.tsx
│   │   ├── main.tsx
│   ├── public/
│   ├── vite.config.ts
│   ├── index.html
│   └── package.json
├── README.md

```
# Environment Variables

To run this project, you will need to add the following environment variables to your .env file

Conda — Virtual environment manager

# 🖥️ Setup & Installation
## Backend Setup
1️⃣ Install Anaconda (if not already installed).

2️⃣ Create and activate Conda environment:
```
conda create -n voicefusion python=3.9
conda activate voicefusion
```
3️⃣ Install dependencies:
```
cd backend
pip install -r requirements.txt
```
4️⃣ Run Django migrations and start server:
```
python manage.py migrate
python manage.py runserver
```
## Frontend Setup

1️⃣ Install Node.js (if not already installed).
2️⃣ Install dependencies:
```
cd frontend
npm install
```
3️⃣ Start server:
```
npm run dev
```
Frontend will be available at: http://localhost:5173
## 🕒 Celery Setup
Celery is used to offload heavy tasks (like Whisper, Wav2Lip) into background workers.

Install Celery & Redis
1️⃣ Activate the Conda environment:

```
conda activate voicefusion
```
2️⃣ Install Celery & Redis client:
```
pip install celery redis
```
3️⃣ Install & start Redis server:

Linux/macOS:
```
sudo apt-get install redis-server
redis-server
```
Windows:

Download Redis: https://github.com/microsoftarchive/redis/releases
Run redis-server.exe.
```
Start Celery Worker
```
Open a new terminal:

cd backend

🔗 Running Backend + Celery Together
```
Terminal 1:

python manage.py runserver

Terminal 2:

python -m celery -A backend_manager worker --loglevel=info
```




## 📬 Contact
✉️ Email: nishakarnishakar06@gmail.com

🌐 GitHub: [NISHAKAR06](https://github.com/NISHAKAR06)


