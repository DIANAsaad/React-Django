import logging
from django.contrib.auth import logout as logout
from main.models import Course, Module

from main.utils import delete_object
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from main.serializers import (
    AchieveUserLoginSerializer,
    AchieveUserSerializer,
    CourseSerializer,
    RefreshTokenSerializer,
    ModuleSerializer,
)
from rest_framework import status
from rest_framework.exceptions import NotFound
from .permissions import (
    IsStaffOrHasDeleteCoursePermission,
    IsStaffOrHasAddCoursePermission,
    IsStaffOrHasAddModulePermission,
    IsStaffOrHasDeleteModulePermission,
)

# Authentication & Authorization

logger = logging.getLogger(__name__)


class CustomLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = AchieveUserLoginSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data["user"]
            # Generates the JWT Tokens
            refresh_token = RefreshToken.for_user(user)
            access_token = str(refresh_token.access_token)
            data = {
                "access_token": access_token,
                "refresh_token": str(refresh_token),
                "user": AchieveUserSerializer(user).data,
            }

            return Response(data, status=status.HTTP_200_OK)

        return Response(
            {"details": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST
        )


class CustomLogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.data.get("refresh_token")
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response(
                    {"message": "Logout successful"}, status=status.HTTP_200_OK
                )
            else:
                return Response(
                    {"error": "Refresh token not provided"},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class GetUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        serializer = AchieveUserSerializer(request.user)
        return Response(serializer.data)


class RefreshAccessTokenView(APIView):

    def post(self, request, *args, **kwargs):
        serializer = RefreshTokenSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        refresh_token_str = serializer.validated_data["refresh_token"]

        try:
            refresh_token = RefreshToken(refresh_token_str)
            new_access_token = str(refresh_token.access_token)
            data = {
                "access_token": new_access_token,
                "refresh_token": str(refresh_token),
            }
            return Response(data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": f"Refresh token is not valid: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


# Web API Views


class HomePageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        courses = Course.objects.prefetch_related("modules").all()
        is_staff = request.user.is_staff
        can_delete_course = request.user.has_perm("main.delete_course")
        can_add_course = request.user.has_perm("main.add_course")
        can_add_module = request.user.has_perms(
            ["main.add_module"]
        )  # Pass a list of permissions
        can_delete_module = request.user.has_perm("main.delete_module")
        data = {
            "courses": CourseSerializer(courses, many=True).data,
            "isStaff": is_staff,
            "canDeleteCourse": can_delete_course,
            "canAddCourse": can_add_course,
            "canAddModule": can_add_module,
            "canDeleteModule": can_delete_module,
        }

        return Response(data, status=status.HTTP_200_OK)


class CoursePageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        course_id = kwargs.get("course_id")
        modules = Module.objects.filter(course_id=course_id).all()
        data = {"modules": ModuleSerializer(modules, many=True).data}
        return Response(data, status=status.HTTP_200_OK)


# Functionality


class AddCourseView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrHasAddCoursePermission]

    def post(self, request, *args, **kwargs):
        serializer = CourseSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            course = serializer.save()
            return Response(
                CourseSerializer(course).data, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteCourseView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrHasDeleteCoursePermission]

    def delete(self, request, *args, **kwargs):
        course_id = kwargs.get("course_id")
        if not course_id:
            return Response(
                {"detail": "Course ID is required."}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            return delete_object(
                request, app_label="main", model_name="Course", object_id=course_id
            )
        except Course.DoesNotExist:
            raise NotFound(detail="Course not found.", code=status.HTTP_404_NOT_FOUND)


class AddModuleView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrHasAddModulePermission]

    def post(self, request, *args, **kwargs):
        serializer = ModuleSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            module = serializer.save()

            return Response(
                ModuleSerializer(module).data, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
