from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import AchieveUser, Course, Module, Flashcard
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
            "module_slug",
        ]
        read_only_fields = ["id", "module_slug"]

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
            "course_slug",
        ]
        read_only_fields = ["id", "course_slug"]

    def create(self, validated_data):

        request = self.context["request"]
        course_image = validated_data.pop("course_image", None)
        course = Course.objects.create(
            creator=request.user, course_image=course_image, **validated_data
        )
        return course


class FlashcardSerializer(serializers.ModelSerializer):
    lesson_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Flashcard
        fields = ["id", "flashcard_question", "flashcard_answer", "lesson_id"]

    def create(self, validated_data):
        lesson_id = validated_data.pop("lesson_id")
        lesson = get_object_or_404(Module, id=lesson_id)
        flashcard = Flashcard.objects.create(lesson=lesson, **validated_data)
        return flashcard
