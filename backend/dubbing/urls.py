from django.urls import path
from . import views
from .views import VideoUploadView, JobStatusView, ProjectListView
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('api-token-auth/', obtain_auth_token, name='api_token_auth'),
    path('upload/', VideoUploadView.as_view(), name='video-upload'),
    path('job/<int:job_id>/', JobStatusView.as_view(), name='job-status'),
    path('projects/', ProjectListView.as_view(), name='project-list'),
    #path('upload/', views.upload_video, name='upload_video'),
]
