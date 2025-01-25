# Generated by Django 5.0.7 on 2025-01-25 17:32

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0025_rename_flashcard_answer_flashcard_answer_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='ExternalLink',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=100)),
                ('link', models.URLField(max_length=2083)),
                ('lesson', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='external_links', to='main.module')),
            ],
        ),
    ]
