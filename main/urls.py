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
    GetModuleView,
    DeleteFlashcardView,
    DeleteLessonFlashcardsView,
    AddExternalLinkView,
    GetExternalLinkView,
    GetExternalLinkByIdView,
    DeleteExternalLinkView,
    EditExternalLinkView,
    AddQuizView,
    GetQuizzesView,
    GetQuizByIdView,
    SubmitAnswersView
)


urlpatterns = [
    path("", CustomLoginView.as_view(), name="Welcome"),
    path("logout", CustomLogoutView.as_view(), name="logout"),
    path("user", GetUserView.as_view(), name="get_user"),
    path("courses", HomePageView.as_view(), name="course-list"),
    path("flashcards/<int:lesson_id>", GetFlashcardView.as_view(), name="flashcard"),
    path("modules/<int:course_id>", CoursePageView.as_view(), name="course_modules"),
    path("module/<int:module_id>", GetModuleView.as_view(), name="module"),
    path(
        "external_links/<int:lesson_id>",
        GetExternalLinkView.as_view(),
        name="external links",
    ),
    path(
        "external_link/<int:link_id>",
        GetExternalLinkByIdView.as_view(),
        name="external link",
    ),
    path("quizzes/<int:module_id>", GetQuizzesView.as_view(), name="quizzes"),
    path("quiz/<int:quiz_id>", GetQuizByIdView.as_view(), name="quiz"),
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
    path(
        "delete_flashcard/<int:flashcard_id>",
        DeleteFlashcardView.as_view(),
        name="delete_Flashcard",
    ),
    path(
        "delete_lesson_flashcards/<int:lesson_id>",
        DeleteLessonFlashcardsView.as_view(),
        name="delete_lesson_flaschards",
    ),
    path("add_external_link", AddExternalLinkView.as_view(), name="add_external_link"),
    path(
        "edit_external_link/<int:link_id>",
        EditExternalLinkView.as_view(),
        name="edit_external_link",
    ),
    path(
        "delete_external_link/<int:link_id>",
        DeleteExternalLinkView.as_view(),
        name="delete_external_link",
    ),
    path("add_quiz", AddQuizView.as_view(), name="add_quiz"),
    path("submit_answers/<int:quiz_id>", SubmitAnswersView.as_view(), name="submit_answers")
]
