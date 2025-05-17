# app/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.core.files.storage import default_storage

class VideoUploadView(APIView):
    def post(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        file_name = default_storage.save(f'videos/{file.name}', file)
        file_url = default_storage.url(file_name)
        return Response({'processedUrl': file_url}, status=status.HTTP_200_OK)