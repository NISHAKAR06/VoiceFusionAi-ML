# dubbing/tasks.py
from celery import shared_task
from .pipeline import dubbing_pipeline

@shared_task
def process_dubbing_task(file_path, job_id):
    dubbing_pipeline(file_path, job_id)