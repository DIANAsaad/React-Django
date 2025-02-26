from django.db import models
from django.utils import timezone
from django.utils.text import slugify
from django.contrib.auth.models import AbstractUser, BaseUserManager
import os

# Create your models here.


class AchieveUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)

        return self.create_user(email, password, **extra_fields)


# We create a custom user model that will inherit the functionality of the build-in user model but making the email as a unique identifier.
class AchieveUser(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    username = models.CharField(max_length=255, blank=True, null=True)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    objects = AchieveUserManager()

    def save(self, *args, **kwargs):
        if not self.username:
            super().save(*args, **kwargs)  # Save to get the id
            self.username = f"{self.first_name.lower()}-{self.id}"

        super().save(*args, **kwargs)

    def __str__(self):
        return self.email


# COURSES & MODULES & Quizzes


class Course(models.Model):
    creator = models.ForeignKey(
        AchieveUser, on_delete=models.SET_NULL, null=True, blank=True
    )
    course_title = models.CharField(max_length=100)
    description = models.TextField()
    course_image = models.ImageField(
        upload_to="course_images/",
        blank=True,
        null=True,
    )
    study_guide = models.URLField(null=True, blank=True, max_length=2083)

    def delete(self, *args, **kwargs):
        if self.course_image:
            course_image_path = self.course_image.path
            if os.path.isfile(course_image_path):
                os.remove(course_image_path)
        super().delete(*args, **kwargs)

    def __str__(self):
        return self.course_title


class Module(models.Model):
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name="modules")
    module_creator = models.ForeignKey(
        AchieveUser, on_delete=models.SET_NULL, null=True
    )
    module_title = models.CharField(max_length=100)
    module_image = models.ImageField(
        upload_to="module_images/",
        blank=True,
        null=True,
    )
    topic = models.TextField()
    lesson_pdf = models.FileField(
        upload_to="module_lesson_pdfs/", blank=True, null=True
    )

    def delete(self, *args, **kwargs):
        if self.module_image:
            module_image_path = self.module_image.path
            if os.path.isfile(module_image_path):
                os.remove(module_image_path)

        if self.lesson_pdf:
            lesson_pdf_path = self.lesson_pdf.path
            if os.path.isfile(lesson_pdf_path):
                os.remove(lesson_pdf_path)
        super().delete(*args, **kwargs)


class Flashcard(models.Model):
    lesson = models.ForeignKey(
        Module, on_delete=models.CASCADE, related_name="flashcards"
    )
    question = models.TextField()
    answer = models.TextField()


# QUIZ


class Quiz(models.Model):
    quiz_title = models.CharField(max_length=100)
    quiz_creator = models.ForeignKey(AchieveUser, on_delete=models.SET_NULL, null=True)
    module = models.ForeignKey(Module, on_delete=models.CASCADE, related_name="quizzes")
    quiz_description = models.TextField()
    total_mark = models.IntegerField()
    time_limit = models.PositiveIntegerField(null=True, blank=True)
    attempts_allowed = models.PositiveIntegerField(null=True, blank=True)

    def __str__(self):
        return self.quiz_title


class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name="questions")
    question_point = models.IntegerField()
    question_time_limit = models.PositiveIntegerField(null=True, blank=True)
    question_text = models.TextField()
    question_type = models.CharField(
        max_length=20,
        choices=[("MCQ", "Multiple Choice"), ("TF", "True/False")],
    )
    correct_answer = models.TextField()
    choices = models.JSONField(null=True, blank=True)  # Only relevant for MCQ


class QuizAttempt(models.Model):
    quiz = models.ForeignKey(
        Quiz, on_delete=models.CASCADE, related_name="quiz_attempts"
    )
    taken_by = models.ForeignKey(
        AchieveUser, on_delete=models.CASCADE, related_name="taken_by"
    )
    taken_at = models.DateTimeField(default=timezone.now)
    total_attempts = models.IntegerField(default=0)
    score = models.PositiveIntegerField(default=0)


class Answer(models.Model):
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name="answers"
    )
    attempt = models.ForeignKey(
        QuizAttempt, on_delete=models.CASCADE, related_name="attempt_answers", default=None
    )
    answer_text = models.TextField(blank=True, null=True)
    is_correct = models.BooleanField(null=True)


# External Links


class ExternalLink(models.Model):
    lesson = models.ForeignKey(
        Module, on_delete=models.CASCADE, related_name="external_links"
    )
    description = models.CharField(max_length=100)
    link = models.URLField(max_length=2083)


# Comment & Uploading Multiple Images (ScreenShots)

class Comment(models.Model):
    lesson=models.ForeignKey(
        Module, on_delete=models.CASCADE, related_name="comments"
    )
    commentor=models.ForeignKey(AchieveUser, on_delete=models.CASCADE, related_name="commentor")
    comment=models.TextField()
    commented_at= models.DateTimeField(default=timezone.now)

class CommentImage(models.Model):
    comment=models.ForeignKey(Comment, on_delete=models.CASCADE, related_name="images")
    image=models.ImageField(upload_to="comment_images/", blank=True, null=True)

    def delete(self, *args, **kwargs):
        if self.image:
            if os.path.isfile(self.image.path):
                os.remove(self.image.path)
        super().delete(*args, **kwargs)
