from django.db import models
from django.contrib.auth.models import User

class DubbingJob(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    video_file = models.FileField(upload_to='videos/')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    progress = models.IntegerField(default=0)
    step_status = models.JSONField(default=dict, blank=True, null=True)
    error_message = models.TextField(blank=True, null=True)
    title = models.CharField(max_length=255, default="Untitled Project")
    created_at = models.DateTimeField(auto_now_add=True)
    result_file = models.FileField(upload_to='results/', blank=True, null=True)
    extracted_audio = models.FileField(upload_to='audio/', blank=True, null=True)
    dubbed_audio_file = models.FileField(upload_to='dubbed_audio/', blank=True, null=True)
    translated_subtitles = models.TextField(blank=True, null=True)
    quality = models.CharField(max_length=20, default='medium')

    def __str__(self):
        return f"DubbingJob {self.id} - {self.status}"
