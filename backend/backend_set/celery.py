import os
from celery import Celery, shared_task
from celery.signals import task_failure
import logging
from dubbing.pipeline import dubbing_pipeline

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend_set.settings')

app = Celery('backend_set')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')

# Celery configuration
app.conf.update(
    broker_url='redis://localhost:6379/0',
    result_backend='redis://localhost:6379/0',
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
)

@shared_task
def process_dubbing_task(video_path, job_id):
    dubbing_pipeline(video_path, job_id=job_id)

@task_failure.connect
def handle_task_failure(task_id=None, exception=None, args=None, kwargs=None, **_):
    """Handle task failures and log them"""
    logger.error(f"Task {task_id} failed: {exception}")
    if args:
        logger.error(f"Task args: {args}")
    if kwargs:
        logger.error(f"Task kwargs: {kwargs}")