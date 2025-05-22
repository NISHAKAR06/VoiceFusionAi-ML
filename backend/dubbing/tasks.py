from celery import shared_task
from django.apps import apps

@shared_task
def process_dubbing_task(video_path, job_id):
    """
    Process a dubbing job asynchronously
    """
    # Import here to avoid circular imports
    from .pipeline import dubbing_pipeline
    
    # Get the model through apps to avoid import issues
    DubbingJob = apps.get_model('dubbing', 'DubbingJob')
    
    try:
        job = DubbingJob.objects.get(id=job_id)
        job.status = 'processing'
        job.save()

        # Run dubbing pipeline
        dubbing_pipeline(video_path, job_id)

        job.status = 'completed'
        job.save()

    except Exception as e:
        if 'job' in locals():
            job.status = 'failed'
            job.error_message = str(e)
            job.save()
        raise