# Generated by Django 5.0.7 on 2024-12-16 15:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0013_alter_question_question_type_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='question',
            name='final_score',
            field=models.IntegerField(null=True),
        ),
    ]
