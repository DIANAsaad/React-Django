# Generated by Django 5.0.7 on 2024-12-14 17:11

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0011_quiz_attempts_allowed_quiz_attempts_taken'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='quiz',
            name='attempts_taken',
        ),
    ]
