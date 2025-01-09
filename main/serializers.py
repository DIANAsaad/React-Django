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

    class Meta:
        model = Module
        fields = ["id", "module_title", "topic", "module_slug", "module_image"]
        read_only_fields = ["id", "module_slug"]
        extra_kwargs = {
            "module_image": {"required": False, "allow_null": True},
        }


class CourseSerializer(serializers.ModelSerializer):
    course_image = serializers.ImageField(required=False, allow_null=True)
    modules = ModuleSerializer(many=True, required=False)
    class Meta:
        model = Course
        fields = [
            "id",
            "course_title", 
            "description",
            "course_image",
            "creator",
            "modules",
        ]
        read_only_fields = ["id", "course_slug"]
        extra_kwargs = {
            "course_image": {"required": False, "allow_null": True},
        }

    def create(self, validated_data):

        request = self.context["request"]
        creator = request.user

        course_image = validated_data.pop("course_image", None)
        if not course_image:
            course_image = None
        course = Course.objects.create(
            creator=creator, course_image=course_image, **validated_data
        )
        course.save()
        return course
