from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage
from .tasks import process_dubbing_task
from .models import DubbingJob

class VideoUploadView(APIView):
    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        job = DubbingJob.objects.create(video_file=file)
        job.save()
        file_path = job.video_file.path
        process_dubbing_task.delay(file_path, job.id)
        return Response({'message': 'File uploaded. Processing started.', 'job_id': job.id}, status=status.HTTP_200_OK)