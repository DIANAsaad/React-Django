# Generated by Django 5.0.7 on 2025-02-24 15:18

import django.db.models.deletion
import django.utils.timezone
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0035_alter_answer_attempt_alter_answer_question'),
    ]

    operations = [
        migrations.CreateModel(
            name='Comment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('comment', models.TextField()),
                ('commented_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('commentor', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='commentor', to=settings.AUTH_USER_MODEL)),
                ('lesson', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='main.module')),
            ],
        ),
    ]
