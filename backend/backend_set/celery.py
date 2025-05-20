from celery import shared_task
from dubbing.pipeline import dubbing_pipeline
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_set.settings')

app = Celery('backend_set')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

@shared_task
def process_dubbing_task(video_path, job_id):
    dubbing_pipeline(video_path, job_id=job_id)