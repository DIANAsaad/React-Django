from django.contrib import admin
from main.models import Course, Module, AchieveUser
from main.forms import RegisterForm
from django.contrib.auth.forms import UserChangeForm
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from main import forms

# Register your models here.


class CourseAdmin(admin.ModelAdmin):
    list_display = ("course_title", "description")


class ModuleAdmin(admin.ModelAdmin):
    list_display = ("module_title", "topic", "course", "lesson_pdf")


# Custom UserAdmin
class CustomUserAdmin(UserAdmin):
    # We use custom form for creating and changing users
    add_form = RegisterForm
    form = UserChangeForm
    model = AchieveUser

    list_display = ("email", "first_name", "last_name", "is_staff")
    search_fields = ("email", "first_name", "last_name")
    ordering = ("email",)
    readonly_fields = ("username",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("first_name", "last_name")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )
    add_fieldsets = (
        (None, {"fields": ("email", "password1", "password2")}),
        ("Personal info", {"fields": ("first_name", "last_name")}),
    )


admin.site.register(AchieveUser, CustomUserAdmin)
admin.site.register(Course, CourseAdmin)
admin.site.register(Module, ModuleAdmin)
