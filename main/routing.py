from django.urls import re_path
from main.consumers import AppConsumer

websocket_urlpatterns = [
    re_path(r'ws/$', AppConsumer.as_asgi()),
]