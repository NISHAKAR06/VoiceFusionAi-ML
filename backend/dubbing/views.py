from django.http import JsonResponse
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes
from .models import DubbingJob
from .tasks import process_dubbing_task
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
import logging
from pathlib import Path
from django.conf import settings
import os

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    email = request.data.get('email')

    if not username or not password or not email:
        return Response({'error': 'Username, password, and email are required'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
    user = User.objects.create_user(username=username, password=password, email=email)
    token, created = Token.objects.get_or_create(user=user)
    return Response({'token': token.key}, status=status.HTTP_201_CREATED)

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    # Authenticate user
    user = authenticate(username=username, password=password)
    
    # If authentication fails, try to find user by email
    if user is None:
        try:
            user_obj = User.objects.get(email=username)
            user = authenticate(username=user_obj.username, password=password)
        except User.DoesNotExist:
            pass

    if user:
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key}, status=status.HTTP_200_OK)
    
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_400_BAD_REQUEST)

class VideoUploadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Check for file in request
            if 'file' not in request.FILES:
                return Response(
                    {'error': 'No file uploaded'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            file = request.FILES['file']
            
            # Validate file format
            allowed_formats = ['.mp4', '.avi', '.mov', '.mkv']
            if not any(file.name.lower().endswith(fmt) for fmt in allowed_formats):
                return Response(
                    {'error': 'Invalid file format. Supported formats: MP4, AVI, MOV, MKV'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Get file name without extension
            file_name = os.path.splitext(file.name)[0]

            # Create dubbing job
            job = DubbingJob.objects.create(
                user=request.user,
                video_file=file,
                title=file_name,
                status='pending',
                progress=0
            )

            # Verify file was saved successfully
            video_path = job.video_file.path
            if not Path(video_path).exists():
                job.status = 'failed'
                job.error_message = 'Failed to save uploaded file'
                job.save()
                return Response(
                    {'error': 'Failed to save uploaded file'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

            # Start processing only if file exists
            process_dubbing_task.delay(str(video_path), job.id)

            return Response({
                "job_id": job.id,
                "status": job.status,
                "progress": job.progress,
                "stepStatus": job.step_status or {},
            })

        except Exception as e:
            logger.error(f"Error in video upload: {str(e)}")
            # Cleanup any partially created files
            if 'job' in locals() and job.video_file:
                try:
                    job.video_file.delete()
                except Exception as cleanup_error:
                    logger.error(f"Cleanup error: {cleanup_error}")
            return Response(
                {'error': 'Internal server error during upload'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# views.py  (drop-in replacement for JobStatusView.get)
class JobStatusView(APIView):
    def get(self, request, job_id):
        try:
            job = DubbingJob.objects.get(id=job_id)
            return Response({
                'status': job.status,
                'progress': job.progress,
                'stepStatus': job.step_status or {},
                # IMPORTANT: serve the *real* relative path
                'result_url': job.result_file.url if job.result_file else None,
                'error': job.error_message
            })
        except DubbingJob.DoesNotExist:
            return Response({'error': 'Job not found'}, status=404)
        except Exception as e:
            logger.exception("Error fetching job status")
            return Response(
                {'error': 'Internal server error'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
class ProjectListView(APIView):
    def get(self, request):
        if request.user.is_authenticated:
            jobs = DubbingJob.objects.filter(user=request.user).order_by('created_at')
            data = []
            for i, job in enumerate(jobs, 1):
                data.append({
                    "id": job.id,
                    "display_id": i,
                    "title": job.title,
                    "status": job.status,
                    "progress": job.progress,
                    "error_message": job.error_message,
                    "created_at": job.created_at,
                })
            return Response(data[::-1])  # Reverse to show newest first
        else:
            # Return an empty list for anonymous users
            return Response([])
