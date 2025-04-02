import json
from channels.generic.websocket import AsyncWebsocketConsumer
import logging
logger = logging.getLogger(__name__)

class AppConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Public group for all users
        self.public_group_name = "LMS"
        self.private_group_name = None  # Initialize private group name

        # Add user to public and private groups if authenticated
        if self.scope["user"].is_authenticated:
            self.private_group_name = f"user_{self.scope['user'].id}"
            await self.channel_layer.group_add(self.public_group_name, self.channel_name)
            await self.channel_layer.group_add(self.private_group_name, self.channel_name)
        else:
            await self.close()  # Close connection for unauthenticated users
        await self.accept()

    async def disconnect(self, close_code):
        # Remove the user from the public group
        await self.channel_layer.group_discard(self.public_group_name, self.channel_name)

        # Remove the user from their private group if it exists
        if self.private_group_name:
          if isinstance(self.private_group_name, str) and len(self.private_group_name) < 100:
            await self.channel_layer.group_discard(self.private_group_name, self.channel_name)
        else:
            logger.warning(f"Invalid private group name: {self.private_group_name}")

    async def receive(self, text_data):
        # Handle messages sent by the frontend
        data = json.loads(text_data)
        message = data.get("message", "")

        # Broadcast frontend messages to the public group
        await self.channel_layer.group_send(
            self.public_group_name,
            {
                "type": "public_message",
                "message": message,
            },
        )

    async def send_event(self, event_type, message):
        """Helper method to send events to the WebSocket."""
        await self.send(text_data=json.dumps({"type": event_type, "message": message}))

    # PUBLIC POOL
    async def public_message(self, event):
        """Handle messages sent to the public group."""
        await self.send_event("public_message", event.get("message", ""))

    # PRIVATE POOL
    async def private_message(self, event):
        """Handle messages sent to the private group."""
        await self.send_event("private_message", event.get("message", ""))

    # ENROLLMENT CREATED
    async def enrollment_created(self, event):
        """Handle enrollment_created event."""
        await self.send_event("enrollment_created", event.get("message", ""))

    # COMMENT CREATED
    async def comment_created(self, event):
        """Handle comment_created event."""
        await self.send_event("comment_created", event.get("message", ""))

    # COMMENT DELETED
    async def comment_deleted(self, event):
        """Handle comment_deleted event."""
        await self.send_event("comment_deleted", event.get("message", ""))

    # GENERIC MESSAGE HANDLER
    async def message(self, event):
        """Handle generic messages."""
        await self.send_event("message", event.get("message", ""))