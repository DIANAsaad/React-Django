from rest_framework.permissions import BasePermission


class IsStaffOrHasPermission(BasePermission):
    def __init__(self, perm):
        self.perm = perm

    def has_permission(self, request, view):
        return request.user and (
            request.user.is_staff or request.user.has_perm(self.perm)
        )

class IsStaffOrHasDeleteCoursePermission(IsStaffOrHasPermission):
        def __init__(self):
           super().__init__("main.delete_course")

class IsStaffOrHasAddCoursePermission(IsStaffOrHasPermission):
    def __init__(self):
        super().__init__("main.add_course")

class IsStaffOrHasAddModulePermission(IsStaffOrHasPermission):
    def __init__(self):
        super().__init__("main.add_module")

class IsStaffOrHasDeleteModulePermission(IsStaffOrHasPermission):
        def __init__(self):
           super().__init__("main.delete_module")