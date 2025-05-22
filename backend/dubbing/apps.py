from django.apps import AppConfig


class DubbingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'dubbing'

    def ready(self):
        # Only import and setup signals when the app is ready
        from . import signals
