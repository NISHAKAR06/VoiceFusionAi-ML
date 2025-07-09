from django.http import JsonResponse
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import DubbingJob
from .tasks import process_dubbing_task
import logging
from pathlib import Path
from django.conf import settings
import os

logger = logging.getLogger(__name__)

class VideoUploadView(APIView):
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

            # Create dubbing job
            job = DubbingJob.objects.create(
                video_file=file,
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
                'job_id': job.id,
                'status': 'pending',
                'message': 'Video uploaded successfully',
                'video_path': str(video_path)  # For debugging
            }, status=status.HTTP_202_ACCEPTED)

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

class JobStatusView(APIView):
    def get(self, request, job_id):
        try:
            job = DubbingJob.objects.get(id=job_id)
            
            # Check if video file still exists
            if job.status != 'completed' and not Path(job.video_file.path).exists():
                job.status = 'failed'
                job.error_message = 'Video file not found'
                job.save()
            
            return Response({
                'status': job.status,
                'progress': job.progress,
                'error': job.error_message if job.status == 'failed' else None,
                'result_url': job.result_file.url if job.status == 'completed' and job.result_file else None,
                'video_path': str(job.video_file.path) if job.video_file else None  # For debugging
            })
        except DubbingJob.DoesNotExist:
            return Response(
                {'error': 'Job not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error fetching job status: {str(e)}")
            return Response(
                {'error': 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )