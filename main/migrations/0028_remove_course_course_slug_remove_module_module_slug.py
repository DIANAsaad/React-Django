# Generated by Django 5.0.7 on 2025-01-26 16:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0027_rename_title_externallink_description'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='course',
            name='course_slug',
        ),
        migrations.RemoveField(
            model_name='module',
            name='module_slug',
        ),
    ]
