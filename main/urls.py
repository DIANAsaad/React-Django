from main import views
from django.urls import path
from main.views import (
    DeleteCourseView,
    CustomLoginView,
    CustomLogoutView,
    GetUserView,
    HomePageView,
    AddCourseView
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView


urlpatterns = [
    path("", CustomLoginView.as_view(), name="Welcome"),
    path("logout", CustomLogoutView.as_view(), name="logout"),
    path("user", GetUserView.as_view(), name="get_user"),
    path("courses", HomePageView.as_view(), name="course-list"),
    path("add_course", AddCourseView.as_view(), name="add_Course"),
    path("course_page/<slug:course_slug>/", views.course_page, name="Course Page"),
    path(
        "course_page/id/<int:course_id>", views.course_page, name="Redirect Course Page"
    ),
    path(
        "course_module/<int:module_id>",
        views.course_module,
        name="Redirect Module Page",
    ),
    path(
        "delete_course/<int:course_id>",
        DeleteCourseView.as_view(),
        name="delete_course",
    ),
    path("course_module/<slug:module_slug>", views.course_module, name="Module Page"),
    path("add_module/<int:course_id>", views.add_module, name="Add Module"),
    path("study_guide/<slug:course_slug>/", views.study_guide, name="Study Guide"),
    path("delete_module/", views.delete_module, name="delete_module"),
    path("add_quiz/<int:module_id>", views.add_quiz, name="Add Quiz"),
    path("quiz/<int:quiz_id>", views.quiz, name="Quiz"),
    path("quiz_results/<int:quiz_id>", views.quiz_results, name="Quiz Results"),
    path("delete_quiz/", views.delete_quiz, name="delete_quiz"),
    path("add_flashcard/<int:module_id>", views.add_flashcard, name="Add Flashcard"),
    path("flashcard/<int:module_id>", views.flashcard, name="Flashcard"),
    path("delete_flashcard/", views.delete_flashcard, name="delete_flashcard"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]
