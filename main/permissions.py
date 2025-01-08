from rest_framework.permissions import BasePermission


class IsStaffOrHasDeletePermission(BasePermission):

    def has_permission(self, request, view):
        return request.user and (
            request.user.is_staff or request.user.has_perms("main.delete_course")
        )

class IsStaffOrHasAddCoursePermission(BasePermission):

    def has_permission(self, request, view):
        return request.user and (
            request.user.is_staff or request.user.has_perms("main.add_course")
        )