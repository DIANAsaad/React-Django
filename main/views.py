from django.contrib.auth import logout as logout
from main.models import (
    Course,
    Module,
    Flashcard,
    ExternalLink,
    Quiz,
    Question,
    Answer,
    QuizAttempt,
    Comment,
    CourseEnrollment,
    AchieveUser
)
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
    QuestionSerializer,
    QuizAttemptSerializer,
    SubmitAnswerSerializer,
    AnswerSerializer,
    CommentSerializer,
    EnrollmentSerializer,
)
from rest_framework import status
from rest_framework.exceptions import NotFound
from .permissions import IsStaffOrIsInstructor, IsCommentorOrHasPerms
import json
from django.db.models import Q
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

# Authentication & Authorization


class CustomLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = AchieveUserLoginSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data["user"]
            user_data = AchieveUserSerializer(user).data
            user_data["is_staff"] = user.is_staff
            user_data["is_instructor"] = user.groups.filter(name="Instructors").exists()
            refresh_token = RefreshToken.for_user(user)
            access_token = str(refresh_token.access_token)
            data = {
                "access_token": access_token,
                "refresh_token": str(refresh_token),
                "user": user_data,
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

        data = serializer.data
        data["is_staff"] = request.user.is_staff
        data["is_instructor"] = request.user.groups.filter(name="Instructors").exists()
        return Response(data)
    
class GetAllUsersView(APIView):
    permission_classes=[IsAuthenticated, IsStaffOrIsInstructor]

    def get(self, request,*args,**kwargs):
        users=AchieveUser.objects.all()
        data={
            "users":AchieveUserSerializer(users, many=True).data
        }
        return Response(data)


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
class GetEnrollmentInfoView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrIsInstructor]

    def get(self, request, *args, **kwargs):
        course_id = kwargs.get("course_id")
        try:
            enrollments = CourseEnrollment.objects.filter(course_id=course_id).all()
            data = {
                "enrollments": EnrollmentSerializer(enrollments, many=True).data,
            }
            return Response(data, status=status.HTTP_200_OK)
        except CourseEnrollment.DoesNotExist:
            return Response(
                {"error": "Enrollment not found"}, status=status.HTTP_404_NOT_FOUND
            )


# Prefecth key is used as a reverese key. (Written in modules, used in course to access all its module.), here its different, im trying to acces
## using prefetch related, a direct attribute from the model that contains the foreign key itself.

class HomePageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        enrollments = CourseEnrollment.objects.filter(user=user).select_related("course")
        courses = [enrollment.course for enrollment in enrollments]
        data = {
            "courses": CourseSerializer(courses, many=True).data,
        }
        return Response(data, status=status.HTTP_200_OK)


# Course page is where we have the lessons of each course (modules)


class CoursePageView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        course_id = kwargs.get("course_id")
        modules = Module.objects.filter(course_id=course_id).all()
        data = {
            "modules": ModuleSerializer(modules, many=True).data,
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
            data = {
                "external_link": ExternalLinkSerializer(external_link).data,
            }

            return Response(data, status=status.HTTP_200_OK)
        except ExternalLink.DoesNotExist:
            return Response(
                {"error": "External link not found"}, status=status.HTTP_404_NOT_FOUND
            )


class GetQuizzesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        module_id = kwargs.get("module_id")
        try:
            quizzes = Quiz.objects.filter(module_id=module_id).all()

            data = {
                "quizzes": QuizSerializer(quizzes, many=True).data,
            }
            return Response(data, status=status.HTTP_200_OK)
        except Quiz.DoesNotExist:
            return Response(
                {"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND
            )


class GetQuizByIdView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        quiz_id = kwargs.get("quiz_id")
        try:
            quiz = get_object_or_404(Quiz, id=quiz_id)
            questions = Question.objects.filter(quiz=quiz)
            data = {
                "quiz": QuizSerializer(quiz).data,
                "questions": QuestionSerializer(questions, many=True).data,
            }
            return Response(data, status=status.HTTP_200_OK)
        except (Quiz.DoesNotExist, Question.DoesNotExist):
            return Response(
                {"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND
            )


class GetQuizResultsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        attempt_id = kwargs.get("attempt_id")
        try:

            attempt = QuizAttempt.objects.prefetch_related(
                "attempt_answers__question"
            ).get(id=attempt_id)
            answers = attempt.attempt_answers.all()

            questions = [answer.question for answer in answers]

            data = {
                "attempt": QuizAttemptSerializer(attempt).data,
                "questions": QuestionSerializer(questions, many=True).data,
                "answers": AnswerSerializer(answers, many=True).data,
            }
            return Response(data, status=status.HTTP_200_OK)

        except (QuizAttempt.DoesNotExist, Answer.DoesNotExist):
            return Response(
                {"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND
            )


class GetCommentsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        lesson_id = kwargs.get("lesson_id")
        user = request.user

        if user.is_staff or user.groups.filter(name="Instructors").exists():
            # Instructors or staff get all comments
            comments = Comment.objects.filter(lesson_id=lesson_id).prefetch_related(
                "images", "replies"
            )
            combined_comments = comments
        else:
            # Students only see their own comments
            comments = Comment.objects.filter(
                Q(commentor=request.user)
                | Q(reply_to_id__isnull=False),  # Get user's comments + all replies
                lesson_id=lesson_id,
            ).prefetch_related("images")
            student_comments = []
            replies = []
            strict_student_replies = []

            for comment in comments:
                if comment.commentor == request.user and comment.reply_to_id is None:
                    student_comments.append(comment)
                else:
                    replies.append(comment)
            for comment in student_comments:
                comment_replies = [
                    reply for reply in replies if reply.reply_to_id == comment.id
                ]
                comment.replies.set(comment_replies)
                strict_student_replies.extend(comment_replies)

            combined_comments = list(comments) + list(strict_student_replies)
        data = {"comments": CommentSerializer(combined_comments, many=True).data}
        return Response(data, status=status.HTTP_200_OK)


# Functionality

# Course


class AddCourseView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrIsInstructor]

    def post(self, request, *args, **kwargs):
        serializer = CourseSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            serializer.save()
            CourseEnrollment.objects.create(user=request.user,enrolled_by=request.user, course_id=serializer.data["id"])
            return Response(serializer.data, status=status.HTTP_201_CREATED)
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
            serializer.save()

            return Response(serializer.data, status=status.HTTP_201_CREATED)
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
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
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
            serializer.save()
            return Response(
                serializer.data,
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

    def post(self, request, *args, **kwargs):
        # Copy the data to manually parse the nested objects since DRF does not natively support them
        data = request.data.copy()
        if "questions" in data and isinstance(data["questions"], str):

            try:
                data["questions"] = json.loads(data["questions"])
            except json.JSONDecodeError:
                return Response(
                    {"error": "Invalid JSON format for questions"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        serializer = QuizSerializer(data=data, context={"request": request})
        try:
            if serializer.is_valid():
                quiz = serializer.save()
                return Response(
                    QuizSerializer(quiz, context={"request": request}).data,
                    status=status.HTTP_201_CREATED,
                )

            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class SubmitAnswersView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        quiz_id = kwargs.get("quiz_id")

        serializer = SubmitAnswerSerializer(
            data=request.data,
            context={"request": request, "quiz_id": quiz_id},
        )

        try:
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Quiz.DoesNotExist:

            return Response(
                {"error": "Quiz not found"}, status=status.HTTP_404_NOT_FOUND
            )


class DeleteQuizView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrIsInstructor]

    def delete(self, request, *args, **kwargs):
        quiz_id = kwargs.get("quiz_id")
        if not quiz_id:
            return Response(
                {"detail": "Quiz ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            return delete_object(
                request,
                app_label="main",
                model_name="Quiz",
                object_id=quiz_id,
            )
        except Quiz.DoesNotExist:
            raise NotFound(detail="Quiz not found.", code=status.HTTP_404_NOT_FOUND)


# Comments (Discussions)


class AddCommentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):

        serializer = CommentSerializer(data=request.data, context={"request": request})
        if serializer.is_valid():
            comment=serializer.save()
             # Send WebSocket message
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                "LMS",  # Group name
                {
                    "type": "comment_created",
                    "message": serializer.data
                }
            )
            
            return Response(status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteCommentView(APIView):
    permission_classes = [IsAuthenticated, IsCommentorOrHasPerms]

    def delete(self, request, *args, **kwargs):
        comment_id = kwargs.get("comment_id")
        if not comment_id:
            return Response(
                {"detail": "Comment ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )
        try:
            comment = Comment.objects.get(id=comment_id)
        except Comment.DoesNotExist:
            raise NotFound(detail="Comment not found.", code=status.HTTP_404_NOT_FOUND)

        # Check permissions, raise exception in case of permission denial
        self.check_object_permissions(request, comment)
        comment.delete()
        return Response(
            {"detail": "Comment deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )


# ENROLLMENT LOGICCC (USERS IN COURSES)


class EnrollUserView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrIsInstructor]

    def post(self, request, *args, **kwargs):

        serializer = EnrollmentSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UnenrollUserView(APIView):
    permission_classes = [IsAuthenticated, IsStaffOrIsInstructor]

    def delete(self, request, *args, **kwargs):
        enrollment_id=kwargs.get("enrollment_id")

        if not enrollment_id:
            return Response({'details':"Enrollment ID is required"}, status=status.HTTP_400_BAD_REQUEST)
        try:
            return delete_object(request, app_label="main", model_name="CourseEnrollment", object_id=enrollment_id)
        except CourseEnrollment.DoesNotExist:
            raise NotFound(detail="Enrollment not found",code=status.HTTP_404_NOT_FOUND)