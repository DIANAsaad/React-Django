from rest_framework.permissions import BasePermission
from main.models import Comment
from rest_framework.exceptions import NotFound


class IsStaffOrIsInstructor(BasePermission):
    def has_permission(self, request, view):
        return request.user and (
            request.user.is_staff
            or request.user.groups.filter(name="Instructors").exists()
        )

class IsCommentorOrHasPerms(BasePermission):
    def has_object_permission(self, request, view, obj):
        if not isinstance(obj, Comment):
            raise NotFound("Comment not found")

        return (
            request.user.is_staff
            or request.user.groups.filter(name="Instructors").exists()
            or obj.commentor == request.user
        )