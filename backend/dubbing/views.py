from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import DubbingJob
from .tasks import process_dubbing_task
import os


# @api_view(['POST'])
# def upload_video(request):
#     try:
#         if 'file' not in request.FILES:
#             return JsonResponse({'error': 'No file uploaded'}, status=400)
            
#         uploaded_file = request.FILES['file']
        
#         # Create media directory if it doesn't exist
#         media_path = os.path.join('media', 'uploads')
#         os.makedirs(media_path, exist_ok=True)
        
#         # Save the file
#         file_path = os.path.join(media_path, uploaded_file.name)
#         with open(file_path, 'wb+') as destination:
#             for chunk in uploaded_file.chunks():
#                 destination.write(chunk)
                
#         # Return response with file details
#         return JsonResponse({
#             'job_id': str(hash(file_path))[:8],  # Generate simple job ID
#             'processedUrl': f'/media/uploads/{uploaded_file.name}',
#             'message': 'File uploaded successfully'
#         })
        
#     except Exception as e:
#         return JsonResponse({
#             'error': str(e)
#         }, status=500)

class VideoUploadView(APIView):
    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=400)
            
        job = DubbingJob.objects.create(video_file=file)
        file_path = job.video_file.path
        process_dubbing_task.delay(file_path, job.id)
        
        return Response({
            'message': 'File uploaded. Processing started.',
            'job_id': job.id,
            'status': job.status,
            'progress': job.progress
        }, status=200)

class JobStatusView(APIView):
    def get(self, request, job_id):
        try:
            job = DubbingJob.objects.get(id=job_id)
            return Response({
                'status': job.status,
                'progress': job.progress,
                'result_url': job.result_file.url if job.result_file else None,
                'error': job.error_message
            })
        except DubbingJob.DoesNotExist:
            return Response({'error': 'Job not found'}, status=404)