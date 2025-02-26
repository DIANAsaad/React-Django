from rest_framework.permissions import BasePermission
from main.models import Comment



class IsStaffOrIsInstructor(BasePermission):
    def has_permission(self, request, view):
        return request.user and (
            request.user.is_staff or request.user.groups.filter(name='Instructors').exists()
        )


  
class IsCommentorOrHasPerms(BasePermission):
    def has_permission(self, request, view):
        if request.user==Comment.commentor:
            return True

        return request.user and ( request.user.is_staff or request.user.groups.filter(name='Instructors').exists()
        )