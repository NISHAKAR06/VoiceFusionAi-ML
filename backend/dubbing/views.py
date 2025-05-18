from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage
from .tasks import process_dubbing_task

class VideoUploadView(APIView):
    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        file_name = default_storage.save(f'videos/{file.name}', file)
        file_path = default_storage.path(file_name)
        # Start dubbing asynchronously (Celery)
        process_dubbing_task.delay(file_path)
        return Response({'message': 'File uploaded. Processing started.'}, status=status.HTTP_200_OK)