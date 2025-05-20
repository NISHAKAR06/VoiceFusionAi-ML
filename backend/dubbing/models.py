from django.db import models

class DubbingJob(models.Model):
    video_file = models.FileField(upload_to='videos/')
    status = models.CharField(max_length=32, default='pending')  # e.g., pending, processing, completed, failed
    progress = models.IntegerField(default=0)  # 0-100
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    result_file = models.FileField(upload_to='dubbed/', null=True, blank=True)