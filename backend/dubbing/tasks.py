from celery import shared_task
from django.apps import apps

@shared_task(bind=True)
def process_dubbing_task(self, video_path, job_id):
    """
    Process a dubbing job asynchronously, with progress updates.
    """
    from .pipeline import dubbing_pipeline
    DubbingJob = apps.get_model('dubbing', 'DubbingJob')
    job = DubbingJob.objects.get(id=job_id)

    def progress_callback(step, status, progress_percent):
        """Callback to update job progress and step status."""
        job.progress = progress_percent
        if job.step_status is None:
            job.step_status = {}
        job.step_status[step] = {"status": status, "progress": 100 if status == "completed" else 0}
        job.save(update_fields=["progress", "step_status"])
        self.update_state(state='PROGRESS', meta={'progress': progress_percent})

    try:
        job.status = 'processing'
        job.save(update_fields=["status"])
        
        dubbing_pipeline(video_path, job_id, progress_callback)

        job.status = 'completed'
        job.progress = 100
        job.save(update_fields=["status", "progress"])

    except Exception as e:
        job.status = 'failed'
        job.error_message = str(e)
        job.save(update_fields=["status", "error_message"])
        raise
