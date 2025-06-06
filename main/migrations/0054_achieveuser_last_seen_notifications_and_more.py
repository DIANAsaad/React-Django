# Generated by Django 5.0.7 on 2025-05-24 18:36

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0053_notification_lesson_alter_notification_reciever'),
    ]

    operations = [
        migrations.AddField(
            model_name='achieveuser',
            name='last_seen_notifications',
            field=models.DateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
        migrations.AddField(
            model_name='notification',
            name='created_at',
            field=models.DateTimeField(blank=True, default=django.utils.timezone.now, null=True),
        ),
    ]
