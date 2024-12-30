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


class AddCourseForm(forms.ModelForm):
    class Meta:
        model = Course
        fields = ["course_title", "description", "course_image", "study_guide"]


class AddModuleForm(forms.ModelForm):
    class Meta:
        model = Module
        fields = ["module_title", "topic", "module_image", "lesson_pdf"]


# Not needed for now (a more complex form created to accept multiple questions dynamically)
class AddQuizForm(forms.ModelForm):
    class Meta:
        model = Quiz
        fields = ["quiz_title", "quiz_description", "time_limit", "total_mark"]


class AddQuestionForm(forms.ModelForm):
    class Meta:
        model = Question
        fields = [
            "question_point",
            "question_time_limit",
            "question_text",
            "question_type",
            "choices",
            "correct_answer",
        ]


class AddAnswerForm(forms.ModelForm):
    class Meta:
        model = Answer
        fields = ["answer_text"]


# Not needed for now (a more complex form created to accept multiple flashcards dynamically)
class AddFlashcardForm(forms.ModelForm):
    class Meta:
        model = Flashcard
        fields = ["flashcard_question", "flashcard_answer", "flashcard_image"]
