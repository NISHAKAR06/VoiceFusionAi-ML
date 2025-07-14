default_app_config = 'backend_manager.apps.BackendSetConfig'
from .celery import app as celery_app

__all__ = ('celery_app',)