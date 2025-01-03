from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import AchieveUser, Course


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


class CourseSerializer(serializers.ModelSerializer):
    course_image = serializers.ImageField()

    class Meta:
        model = Course
        fields = ["id", "course_title", "description", "course_image", "creator"]
        read_only_fields = ["id", "course_slug"]

    def create(self, validated_data):
        request=self.context.pop('request')
        creator=request.user
        course_image=validated_data.pop('course_image', None)
        course=Course.objects.create(creator=creator, course_image=course_image, **validated_data)
        course.save()
        return course


