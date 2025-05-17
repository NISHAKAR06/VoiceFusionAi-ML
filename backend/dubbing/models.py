# app/models.py
from django.db import models

class UploadedVideo(models.Model):
    file = models.FileField(upload_to='videos/')
    uploaded_at = models.DateTimeField(auto_now_add=True)