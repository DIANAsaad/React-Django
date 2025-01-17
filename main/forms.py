from django import forms
from django.contrib.auth.forms import UserCreationForm
from main.models import Course, Module, AchieveUser, Quiz, Question, Answer, Flashcard


class RegisterForm(UserCreationForm):
    email = forms.EmailField(required=True)
    first_name = forms.CharField(max_length=255)
    last_name = forms.CharField(max_length=255)

    class Meta:
        model = AchieveUser
        fields = ["email", "password1", "password2", "first_name", "last_name"]


