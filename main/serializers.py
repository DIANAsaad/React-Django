from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import AchieveUser, Course, Module


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
    lesson_pdf= serializers.FileField(required=False, allow_null=True)
    class Meta:
        model = Module
        fields = [
            "id",
            "module_title",
            "topic",
            "module_slug",
            "module_image",
            "module_creator",
            "lesson_pdf",
        ]
        read_only_fields = ["id", "module_slug"]
        extra_kwargs = {
            "module_image": {"required": False, "allow_null": True},
            "lesson_pdf": {"required": False, "allow_null": True},
        }

    def create(self, validated_data):

        request = self.context["request"]

        module_image = validated_data.pop("module_image", None)
        lesson_pdf = validated_data.pop("lesson_pdf", None)
        if not module_image:
            module_image = None
        if not lesson_pdf:
            lesson_pdf = None 
        module = Module.objects.create(
            module_creator=request.user, module_image=module_image, lesson_pdf=lesson_pdf, **validated_data
        )
        return module


class CourseSerializer(serializers.ModelSerializer):
    course_image = serializers.ImageField(required=False, allow_null=True)
    modules = ModuleSerializer(many=True, required=False)
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
            "modules",
        ]
        read_only_fields = ["id", "course_slug"]
        extra_kwargs = {
            "course_image": {"required": False, "allow_null": True},
        }

    def create(self, validated_data):

        request = self.context["request"]

        course_image = validated_data.pop("course_image", None)
        if not course_image:
            course_image = None
        course = Course.objects.create(
            creator=request.user, course_image=course_image, **validated_data
        )
        return course
