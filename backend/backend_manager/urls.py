from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path, include
from dubbing import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('dubbing/', include('dubbing.urls')),
    path('api/login/', views.login_view, name='api-login'),
    path('api/signup/', views.signup_view, name='api-signup'),
    path('dubbing/jobs/<int:job_id>/dubbed-audio/', views.serve_dubbed_audio, name='serve_dubbed_audio'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
