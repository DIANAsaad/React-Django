import logging
from django.contrib.auth import logout as logout
from main.models import Course, Module, Flashcard, ExternalLink
from django.shortcuts import get_object_or_404
from main.utils import delete_object, delete_object_by_condition
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
    FlashcardSerializer,
    ExternalLinkSerializer,
    QuizSerializer,
)
from rest_framework import status
from rest_framework.exceptions import NotFound
from .permissions import IsStaffOrIsInstructor
import json
import traceback

# Authentication & Authorization

logger = logging.getLogger(__name__)


class CustomLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = AchieveUserLoginSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data["user"]
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

        courses = Course.objects.all()
        is_staff = request.user.is_staff
        data = {
            "courses": CourseSerializer(courses, many=True).data,
            "isStaff": is_staff,
            "isInstructor": request.user.groups.filter(name="Instructors").exists(),
        }

        return Response(data, status=status.HTTP_200_OK)


# Course page is where we have the lessons of each course (modules)


class CoursePageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        course_id = kwargs.get("course_id")
        is_staff = request.user.is_staff
        modules = Module.objects.filter(course_id=course_id).all()
        data = {
            "modules": ModuleSerializer(modules, many=True).data,
            "isStaff": is_staff,
            "isInstructor": request.user.groups.filter(name="Instructors").exists(),
        }
        return Response(data, status=status.HTTP_200_OK)


# Components of the Module (lesson) page
class GetModuleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        module_id = kwargs.get("module_id")
        try:
            module = get_object_or_404(Module, id=module_id)

            data = {
                "module": ModuleSerializer(module).data,
                "isStaff": request.user.is_staff,
                "isInstructor": request.user.groups.filter(name="Instructors").exists(),
            }
            return Response(data, status=status.HTTP_200_OK)
        except Module.DoesNotExist:
            return Response(
                {"error": "Module not found"}, status=status.HTTP_404_NOT_FOUND
            )


class GetFlashcardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        lesson_id = kwargs.get("lesson_id")
        try:

            flashcards = Flashcard.objects.filter(lesson_id=lesson_id).all()
            data = {
                "flashcards": FlashcardSerializer(flashcards, many=True).data,
                "isStaff": request.user.is_staff,
                "isInstructor": request.user.groups.filter(name="Instructors").exists(),
            }
            return Response(data, status=status.HTTP_200_OK)
        except Flashcard.DoesNotExist:
            return Response(
                {"error": "Flashcard not found"}, status=status.HTTP_404_NOT_FOUND
            )


class GetExternalLinkView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        lesson_id = kwargs.get("lesson_id")
        try:

            external_links = ExternalLink.objects.filter(lesson_id=lesson_id).all()
            data = {
                "external_links": ExternalLinkSerializer(
                    external_links, many=True
                ).data,
                "isStaff": request.user.is_staff,
                "isInstructor": request.user.groups.filter(name="Instructors").exists(),
            }
            return Response(data, status=status.HTTP_200_OK)
        except ExternalLink.DoesNotExist:
            return Response(
                {"error": "External link not found"}, status=status.HTTP_404_NOT_FOUND
            )


class GetExternalLinkByIdView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrIsInstructor]

    def get(self, request, *args, **kwargs):
        link_id = kwargs.get("link_id")
        try:
            external_link = get_object_or_404(ExternalLink, id=link_id)
            data = {"external_link": ExternalLinkSerializer(external_link).data}

            return Response(data, status=status.HTTP_200_OK)
        except ExternalLink.DoesNotExist:
            return Response(
                {"error": "External link not found"}, status=status.HTTP_404_NOT_FOUND
            )


# Functionality

# Course


class AddCourseView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrIsInstructor]

    def post(self, request, *args, **kwargs):
        serializer = CourseSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            course = serializer.save()
            return Response(
                CourseSerializer(course).data, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteCourseView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrIsInstructor]

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


# Module


class AddModuleView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrIsInstructor]

    def post(self, request, *args, **kwargs):

        serializer = ModuleSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            module = serializer.save()

            return Response(
                ModuleSerializer(module).data, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteModuleView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrIsInstructor]

    def delete(self, request, *args, **kwargs):
        module_id = kwargs.get("module_id")
        if not module_id:
            return Response(
                {"detail": "Module ID is required."}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            return delete_object(
                request, app_label="main", model_name="Module", object_id=module_id
            )
        except Module.DoesNotExist:
            raise NotFound(detail="Module not found.", code=status.HTTP_404_NOT_FOUND)


# Flashcards


class AddFlashcardView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrIsInstructor]

    def post(self, request, *args, **kargs):

        serializer = FlashcardSerializer(data=request.data)
        if serializer.is_valid():
            flashcard = serializer.save()
            return Response(
                FlashcardSerializer(flashcard).data, status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteFlashcardView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrIsInstructor]

    def delete(self, request, *args, **kwargs):
        flashcard_id = kwargs.get("flashcard_id")

        if not flashcard_id:
            return Response(
                {"detail": "Flashcard ID is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            return delete_object(
                request,
                app_label="main",
                model_name="Flashcard",
                object_id=flashcard_id,
            )
        except Flashcard.DoesNotExist:
            raise NotFound(
                detail="Flashcard not found.", code=status.HTTP_404_NOT_FOUND
            )


class DeleteLessonFlashcardsView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrIsInstructor]

    def delete(self, request, *args, **kwargs):

        lesson_id = kwargs.get("lesson_id")
        if not lesson_id:
            return Response(
                {"detail": "Lesson ID is required."}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            return delete_object_by_condition(
                request, app_label="main", model_name="Flashcard", lesson_id=lesson_id
            )
        except Flashcard.DoesNotExist:
            raise NotFound(
                detail="Flashcard not found.", code=status.HTTP_404_NOT_FOUND
            )


# Exernal Links


class AddExternalLinkView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrIsInstructor]

    def post(self, request, *args, **kargs):
      
        serializer = ExternalLinkSerializer(data=request.data)
        if serializer.is_valid():
            external_link = serializer.save()
            return Response(
                ExternalLinkSerializer(external_link).data,
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EditExternalLinkView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrIsInstructor]

    def put(self, request, *args, **kwargs):
        try:
            link_id = kwargs.get("link_id")
            external_link = ExternalLink.objects.get(id=link_id)
            serializer = ExternalLinkSerializer(external_link, data=request.data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except ExternalLink.DoesNotExist:
            return Response(
                {"error": "External link not found"}, status=status.HTTP_404_NOT_FOUND
            )


class DeleteExternalLinkView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrIsInstructor]

    def delete(self, request, *args, **kwargs):
        link_id = kwargs.get("external_link_id")

        if not link_id:
            return Response(
                {"detail": "Link ID is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            return delete_object(
                request,
                app_label="main",
                model_name="ExternalLink",
                object_id=link_id,
            )
        except ExternalLink.DoesNotExist:
            raise NotFound(detail="Link not found.", code=status.HTTP_404_NOT_FOUND)


# Quizzes


class AddQuizView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrIsInstructor]
    
    def post(self, request, *args, **kargs):
        data=request.data.copy()
        print(data)
        if "questions" in data and isinstance(data["questions"], str):
            print(data['questions'])
            try:
                data["questions"] = json.loads(data["questions"])
            except json.JSONDecodeError:
                return Response({"error": "Invalid JSON format for questions"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = QuizSerializer(data=data, context={"request": request})
        print(serializer)
        try:
           if serializer.is_valid():
              print(serializer.validated_data)
              quiz=serializer.save()
              return Response(QuizSerializer(quiz).data, status=status.HTTP_201_CREATED)
           print("s.error:",serializer.errors)
           return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            print("error:",e)
            traceback.print_exc()
            return Response({"error":str(e)}, status=status.HTTP_400_BAD_REQUEST)