from celery import shared_task
from .pipeline import dubbing_pipeline

@shared_task
def process_dubbing_task(video_path):
    dubbing_pipeline(video_path)