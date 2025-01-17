from django.urls import path
from main.views import (
    CustomLoginView,
    CustomLogoutView,
    GetUserView,
    RefreshAccessTokenView,
    HomePageView,
    AddCourseView,
    DeleteCourseView,
    AddModuleView,
    DeleteModuleView,
    CoursePageView,
    AddFlashcardView,
    GetFlashcardView,
    GetModuleView
)


urlpatterns = [
    path("", CustomLoginView.as_view(), name="Welcome"),
    path("logout", CustomLogoutView.as_view(), name="logout"),
    path("user", GetUserView.as_view(), name="get_user"),
    path("courses", HomePageView.as_view(), name="course-list"),
    path("flashcards/<int:lesson_id>", GetFlashcardView.as_view(), name="flashcard"),
    path("modules/<int:course_id>", CoursePageView.as_view(), name="course_modules"),
    path("module/<int:module_id>", GetModuleView.as_view(),  name="module"),
    path("add_course", AddCourseView.as_view(), name="add_Course"),
    path(
        "refresh_access_token",
        RefreshAccessTokenView.as_view(),
        name="refresh_access_token",
    ),
    path(
        "delete_course/<int:course_id>",
        DeleteCourseView.as_view(),
        name="delete_course",
    ),
    path("add_module", AddModuleView.as_view(), name="add_module"),
    path(
        "delete_module/<int:module_id>",
        DeleteModuleView.as_view(),
        name="delete_module",
    ),
     path("add_flashcard", AddFlashcardView.as_view(), name="add_Flashcard"),

]
