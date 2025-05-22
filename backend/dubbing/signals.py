from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import DubbingJob

@receiver(post_save, sender=DubbingJob)
def handle_dubbing_job_update(sender, instance, created, **kwargs):
    if created:
        # Handle new job creation
        pass
    else:
        # Handle job updates
        pass