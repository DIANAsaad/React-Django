import json
from channels.generic.websocket import AsyncWebsocketConsumer
import logging
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from jwt import decode as jwt_decode
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken
from django.conf import settings
from rest_framework_simplejwt.tokens import UntypedToken

logger = logging.getLogger(__name__)


# JWT DECODING AND USER POPULATION
# DB QUIERIES ARE SYNC< CONSUMERS ARE ASUNC< WE SHALL USE THIS TO RUN SYNCH IN DIFFERENT THREAD>(SAFER)
@database_sync_to_async
def get_user_from_token(token):
    User = get_user_model()
    try:
        # Validate the Token
        UntypedToken(token)
        # Decode the JWT token
        decoded_data = jwt_decode(token, settings.SECRET_KEY, algorithms=["HS256"])

        # Get user_id from token payload
        user_id = decoded_data.get("user_id")

        if user_id:
            return User.objects.get(
                id=user_id
            )  ## we c an ommit the else statement since return statment id it excutes, it will ignore the other return statmenet.
        return AnonymousUser
    except (InvalidToken, TokenError) as e:
        logger.warning(f"Invalid JWT token:{e}")
        return AnonymousUser
    except User.DoesNotExist:
        logger.warning(f"User is not found")
        return AnonymousUser
    except Exception as e:
        logger.warning(f"Coudlnt excute the token: {e}")
        return AnonymousUser


class AppConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Initialize group name
        self.public_group_name = "LMS"
        self.private_group_name = None
        self.can_edit_group_name = "Editors"
        token = self.scope.get("query_string", b"").decode().split("=")[-1]

        # Add user to public and private groups if authenticated

        if token:
            self.scope["user"] = await get_user_from_token(token=token)
            if self.scope["user"].is_authenticated:
                self.private_group_name = f"user_{self.scope['user'].id}"
                await self.channel_layer.group_add(
                    self.public_group_name, self.channel_name
                )
                await self.channel_layer.group_add(
                    self.private_group_name, self.channel_name
                )
                if (
                    self.scope["user"].is_staff
                    or self.scope["user"].groups.filter(name="instructors").exists()
                ):
                    await self.channel_layer.group_add(
                        self.can_edit_group_name, self.channel_name
                    )
            else:
                await self.close()
        else:
            await self.close()  # Close connection for unauthenticated users
        await self.accept()

    async def disconnect(self, close_code):
        # Remove the user from the public group
        await self.channel_layer.group_discard(
            self.public_group_name, self.channel_name
        )

        # Remove the user from their private group if it exists
        if self.private_group_name:
            if (
                isinstance(self.private_group_name, str)
                and len(self.private_group_name) < 100
            ):
                await self.channel_layer.group_discard(
                    self.private_group_name, self.channel_name
                )
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

    # ENROLLMENT CREATED (COURSE FOR STUDENTS)
    async def enrollment_created(self, event):
        """Handle enrollment_created event."""
        await self.send_event("enrollment_created", event.get("message", ""))

    # ENROLLMENT DETAILS (ENROLLED STUDENTS FOR TEACHERS)
    async def enrollment_details(self, event):
        """Handle enrollment_details event."""
        await self.send_event("enrollment_details", event.get("message", ""))

    # ENROLLMENT DELETED (STUDENTS)
    async def enrollment_deleted(self, event):
        """Handle enrollment_deleted event."""
        await self.send_event("enrollment_deleted", event.get("message", ""))

    # UNENROLLMENT DETAILS(TEACHERS)
    async def unenrollment_details(self, event):
        """Handle unenrollment_details event."""
        await self.send_event("unenrollment_details", event.get("message", ""))

    # COMMENT CREATED
    async def comment_created(self, event):
        """Handle comment_created event."""
        await self.send_event("comment_created", event.get("message", ""))

    async def student_commented(self, event):
        """Handle comment_created event."""
        await self.send_event("student_commented", event.get("message", ""))

    # COMMENT DELETED
    async def comment_deleted(self, event):
        """Handle comment_deleted event."""
        await self.send_event("comment_deleted", event.get("message", ""))

    # GENERIC MESSAGE HANDLER
    async def message(self, event):
        """Handle generic messages."""
        await self.send_event("message", event.get("message", ""))
