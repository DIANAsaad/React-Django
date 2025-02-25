from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import (
    AchieveUser,
    Course,
    Module,
    Flashcard,
    ExternalLink,
    Quiz,
    Question,
    Answer,
    QuizAttempt,
    Comment,
    CommentImage,
)
from django.shortcuts import get_object_or_404


class AchieveUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = AchieveUser
        fields = ["id", "first_name", "last_name", "email"]


class AchieveUserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        user = authenticate(username=email, password=password)
        if user is None:
            raise serializers.ValidationError("Invalid email or password")
        data["user"] = user
        return data


class RefreshTokenSerializer(serializers.Serializer):
    refresh_token = serializers.CharField(required=True)


#  WEB CONTENT

# Course


class CourseSerializer(serializers.ModelSerializer):
    course_image = serializers.ImageField(required=False, allow_null=True)
    creator = AchieveUserSerializer(read_only=True)

    class Meta:
        model = Course
        fields = [
            "id",
            "course_title",
            "description",
            "course_image",
            "study_guide",
            "creator",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        request = self.context["request"]
        course_image = validated_data.pop("course_image", None)
        course = Course.objects.create(
            creator=request.user, course_image=course_image, **validated_data
        )
        return course


# Module


class ModuleSerializer(serializers.ModelSerializer):
    module_image = serializers.ImageField(required=False, allow_null=True)
    lesson_pdf = serializers.FileField(required=False, allow_null=True)
    course_id = serializers.IntegerField(write_only=True)
    module_creator = AchieveUserSerializer(read_only=True)

    class Meta:
        model = Module
        fields = [
            "id",
            "module_title",
            "topic",
            "module_image",
            "module_creator",
            "lesson_pdf",
            "course_id",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):

        request = self.context["request"]
        course_id = validated_data.pop("course_id")
        module_image = validated_data.pop("module_image", None)
        lesson_pdf = validated_data.pop("lesson_pdf", None)
        course = get_object_or_404(Course, id=course_id)
        module = Module.objects.create(
            module_creator=request.user,
            module_image=module_image,
            lesson_pdf=lesson_pdf,
            course=course,
            **validated_data
        )
        return module


# Flashcards


class FlashcardSerializer(serializers.ModelSerializer):
    lesson_id = serializers.IntegerField()

    class Meta:
        model = Flashcard
        fields = ["id", "question", "answer", "lesson_id"]

    def create(self, validated_data):
        lesson_id = validated_data.pop("lesson_id")
        lesson = get_object_or_404(Module, id=lesson_id)
        flashcard = Flashcard.objects.create(lesson=lesson, **validated_data)
        return flashcard


# External Links (Resourses)


class ExternalLinkSerializer(serializers.ModelSerializer):
    lesson_id = serializers.IntegerField()

    class Meta:
        model = ExternalLink
        fields = ["id", "description", "link", "lesson_id"]

    def create(self, validated_data):

        lesson_id = validated_data.pop("lesson_id")
        lesson = get_object_or_404(Module, id=lesson_id)
        external_link = ExternalLink.objects.create(lesson=lesson, **validated_data)
        return external_link


# Quizz


class QuestionSerializer(serializers.ModelSerializer):
    question_time_limit = serializers.IntegerField(required=False)
    question_point = serializers.IntegerField()
    choices = serializers.ListField(child=serializers.CharField())

    class Meta:
        model = Question
        fields = [
            "id",
            "question_point",
            "question_time_limit",
            "question_text",
            "question_type",
            "correct_answer",
            "choices",
        ]


class QuizSerializer(serializers.ModelSerializer):
    quiz_creator = AchieveUserSerializer(read_only=True)
    module_id = serializers.IntegerField()
    time_limit = serializers.IntegerField(required=False)
    total_mark = serializers.IntegerField()
    attempts_allowed = serializers.IntegerField(required=False)
    questions = QuestionSerializer(many=True)

    class Meta:
        model = Quiz
        fields = [
            "id",
            "quiz_title",
            "quiz_description",
            "total_mark",
            "time_limit",
            "module_id",
            "quiz_creator",
            "attempts_allowed",
            "questions",
        ]

    def create(self, validated_data):
        request = self.context["request"]
        questions = validated_data.pop("questions", [])
        module_id = validated_data.pop("module_id")
        quiz_creator = request.user

        module = get_object_or_404(Module, id=module_id)
        quiz = Quiz.objects.create(
            quiz_creator=quiz_creator, module=module, **validated_data
        )
        question_list = []
        for question in questions:
            question_instance = Question(quiz=quiz, **question)
            question_list.append(question_instance)
        Question.objects.bulk_create(question_list)
        return quiz


class QuizAttemptSerializer(serializers.ModelSerializer):
    taken_by = AchieveUserSerializer(read_only=True)

    class Meta:
        model = QuizAttempt
        fields = [
            "id",
            "taken_by",
            "taken_at",
            "total_attempts",
            "score",
        ]


class AnswerSerializer(serializers.ModelSerializer):
    question_id = serializers.IntegerField()

    class Meta:
        model = Answer
        fields = ["id", "answer_text", "question_id", "is_correct"]


class SubmitAnswerSerializer(serializers.Serializer):
    answers = AnswerSerializer(many=True)

    def validate(self, data):
        if "answers" not in data:
            raise serializers.ValidationError({"error": "Missing 'answers' field"})
        return data

    def create(self, validated_data):
        request = self.context["request"]
        quiz_id = self.context["quiz_id"]
        if "answers" not in validated_data:
            raise serializers.ValidationError(
                {"error": "Key 'answers' is missing in validated_data"}
            )
        answers = validated_data.get("answers", [])

        taken_by = request.user
        answers_list = []
        score = 0

        # We count previous attempts and create a new attempt to link it with the answers table
        prev_attempt = QuizAttempt.objects.filter(
            taken_by=taken_by, quiz_id=quiz_id
        ).count()
        total_attempt = prev_attempt + 1
        attempt = QuizAttempt.objects.create(
            quiz_id=quiz_id,
            taken_by=taken_by,
            total_attempts=total_attempt,
        )

        # Answers Logic
        for answer in answers:
            question_id = answer.pop("question_id")
            answer_text = answer.pop("answer_text")
            question_data = (
                Question.objects.filter(id=question_id)
                .values("correct_answer", "question_point")
                .first()
            )

            if not question_data:
                raise serializers.ValidationError("Invalid question id")

            correct_answer = question_data["correct_answer"]
            question_point = question_data["question_point"]

            is_correct = answer_text == correct_answer
            if is_correct:
                score += question_point

            answers_list.append(
                Answer(
                    answer_text=answer_text,
                    is_correct=is_correct,
                    question_id=question_id,
                    attempt=attempt,
                )
            )

        Answer.objects.bulk_create(answers_list)

        attempt.score = score
        attempt.save(update_fields=["score"])

        return {
            "id": attempt.id
        }  # returning the attempt id to always direct us to the last attempt.

    def to_representation(self, instance):
        return instance


class CommentImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = CommentImage
        fields = ["id", "image"]


class CommentSerializer(serializers.ModelSerializer):
    commentor = AchieveUserSerializer(read_only=True)
    images = CommentImageSerializer(many=True, required=False)
    lesson_id = serializers.IntegerField()

    class Meta:
        model = Comment
        fields = ["id", "comment", "commentor", "images", "lesson_id"]

    def to_internal_value(self, data):
        images_data = data.getlist("images")
        internal_value = super().to_internal_value(data)
        internal_value["images"] = images_data
        return internal_value

    def create(self, validated_data):
        request = self.context["request"]
        images = validated_data.pop("images", [])
        lesson_id = validated_data.pop("lesson_id")
        commentor = request.user
        comment = Comment.objects.create(
            commentor=commentor, lesson_id=lesson_id, **validated_data
        )
        image_list = []
        for image in images:
            image = CommentImage(comment=comment, image=image)
            image_list.append(image)
        CommentImage.objects.bulk_create(image_list)
        return comment
