from rest_framework.permissions import BasePermission



class IsStaffOrIsInstructor(BasePermission):
    def has_permission(self, request):
        return request.user and (
            request.user.is_staff or request.user.groups.filter(name='Instructors').exists()
        )


  
  