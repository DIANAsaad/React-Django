from django.urls import path
from main.consumers import AppConsumer

websocket_urlpatterns = [
    path('ws/', AppConsumer.as_asgi()),
]