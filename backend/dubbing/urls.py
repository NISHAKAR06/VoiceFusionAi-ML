from django.urls import path
from . import views
from .views import VideoUploadView, JobStatusView 

urlpatterns = [
    path('upload/', VideoUploadView.as_view(), name='video-upload'),
    path('job/<int:job_id>/', JobStatusView.as_view(), name='job-status'),
    #path('upload/', views.upload_video, name='upload_video'),
]