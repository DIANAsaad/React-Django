# Generated by Django 5.0.7 on 2024-12-17 13:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0017_quizattempt'),
    ]

    operations = [
        migrations.AddField(
            model_name='quizattempt',
            name='score',
            field=models.IntegerField(null=True),
        ),
    ]
