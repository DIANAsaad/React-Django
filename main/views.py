from django.shortcuts import render, redirect
from django.shortcuts import HttpResponse
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required, permission_required
from django.contrib.auth import logout as logout
from main.models import Course, Module, Quiz, Question, Answer, QuizAttempt, Flashcard
from main.forms import AddCourseForm, AddModuleForm, AddQuestionForm, AddAnswerForm, AddFlashcardForm
from django.shortcuts import get_object_or_404
import json
from django.db.models import OuterRef, Subquery
from django.forms import inlineformset_factory, modelformset_factory
from django.db import transaction
from main.utils import delete_object
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from .serializers import AchieveUserLoginSerializer
from rest_framework import status
#Authentication & Authorization

class CustomLoginView(APIView):
    permission_classes = [AllowAny] 
    
    def post(self,request,*args,**kargs):
        serializer=AchieveUserLoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user=serializer.validated_data['user']
            #Generates the JWT Tokens
            refresh= RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            
            return Response({"acces_token":access_token}, 
                            status=status.HTTP_200_OK)
        return Response(
            {"details":'user not found'},
            status=status.HTTP_400_BAD_REQUEST
        )
   
class CustomLogoutView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self,request,*args,**kwargs):
      data=request.data
      user=data.user
      try:
          refresh_token=request.data.get('refresh_token')
          if refresh_token:
              token=RefreshToken(refresh_token)
              token.blacklist()
          else:
              pass
          
          return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)

      except Exception as e:
       return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

#Web functionality

@login_required(login_url='/')
def home(request):
   courses=Course.objects.all()
   return render (request, 'main/home.html', {'courses':courses})

@login_required(login_url='/')
def course_page(request,course_slug=None, course_id=None):
   if course_slug:
      course= get_object_or_404(Course.objects.prefetch_related('modules'), course_slug=course_slug)
   elif course_id: 
      course= get_object_or_404(Course.objects.prefetch_related('modules'), id=course_id)
   return render (request, 'main/course/course_page.html',{'course':course} ) 

@login_required(login_url='/')
def course_module(request,module_slug=None, module_id=None):
   if module_slug:
      module=get_object_or_404(Module.objects.prefetch_related('quizzes', 'flashcards'), module_slug=module_slug)
   elif module_id:
      module=get_object_or_404(Module.objects.prefetch_related('quizzes', 'flashcards'), id=module_id)
   return render (request, 'main/course/course_module.html',{'module':module} )


@login_required(login_url='/')
def study_guide(request, course_slug):
    course = Course.objects.only('study_guide').get(course_slug=course_slug)
    return render(request, 'main/course/study_guide.html', {'study_guide': course.study_guide, 'id':course.id, 'course_title':course.course_title})


@login_required(login_url='/')
def flashcard(request,module_id):
    flashcards=Flashcard.objects.filter(lesson_id=module_id).all()
    return render(request, 'main/course/lesson_flashcard/flashcard.html', {'flashcards': flashcards})


@login_required(login_url='/')
def quiz_results(request, quiz_id):
    quiz = get_object_or_404(
        Quiz.objects.prefetch_related("quiz_attempts"),
        id=quiz_id
    )
    latest_answer_subquery = (
        Answer.objects.filter(
            answered_by=request.user,
            question=OuterRef('pk')
        )
        .order_by('-answered_at')
        .values('pk')[:1]
    )
    questions = Question.objects.filter(quiz=quiz).annotate(
        latest_answer_id=Subquery(latest_answer_subquery)
    )
    latest_answer_ids = [
        q.latest_answer_id for q in questions if q.latest_answer_id is not None
    ]
    latest_answers_qs = Answer.objects.filter(pk__in=latest_answer_ids).values(
        'id', 'question_id', 'answer_text', 'is_correct'
    )
    latest_answers_map = {ans['question_id']: ans for ans in latest_answers_qs}
    for q in questions:
        q.latest_answer = latest_answers_map.get(q.pk, None)
    latest_attempt = quiz.quiz_attempts.filter(taken_by=request.user).order_by('-taken_at').first()
    quiz.latest_attempt = latest_attempt
    quiz.annotated_questions = list(questions)
    return render(
        request,
        'main/course/quiz/quiz_results.html',
        {
            'quiz': quiz
        }
    )
    
    
# Creation of Courses & Modules...


@permission_required("main.add_course",login_url="/", raise_exception=True)
def add_course(request):
     if request.method=='POST':
      form=AddCourseForm(request.POST)
      if form.is_valid():
         course=form.save(commit=False)
         course.creator=request.user
         if 'course_image' in request.FILES:
           course.course_image=request.FILES['course_image']
         course.save()
         return redirect('/home')
     else:
       form=AddCourseForm()
     return render (request, 'main/course/add_course.html', {'form' :form})


@permission_required("main.add_module",login_url="/", raise_exception=True)
def add_module(request, course_id):
   if request.method=='POST':
      form=AddModuleForm(request.POST)
      if form.is_valid():
         module=form.save(commit=False)
         if 'module_image' in request.FILES:
           module.module_image=request.FILES['module_image']
         if 'lesson_pdf' in request.FILES:
            module.lesson_pdf=request.FILES['lesson_pdf']
         module.course=Course.objects.get(id=course_id)
         module.module_creator=request.user
         module.save()
         return redirect('Redirect Course Page', course_id=course_id)       
   else:
      form=AddModuleForm()
   return render(request,'main/course/add_module.html', {'form': form , 'course_id':course_id})

@permission_required("main.add_flashcard",login_url="/", raise_exception=True)
def add_flashcard(request, module_id):
    if request.method == 'POST':
        data=request.POST
        try:
            # Extract the number of flashcards submitted
            flashcard_count = int(data.get('flashcard_count', 0))
            lesson = get_object_or_404(Module, id=module_id)
            flashcards_to_create = []
            for i in range(flashcard_count):
                question_key = f'flashcard_question_{i}'
                answer_key = f'flashcard_answer_{i}'
                image_key = f'flashcard_image_{i}'
                
                question = data.get(question_key)
                answer = data.get(answer_key)
                image = request.FILES.get(image_key)

                if question and answer:
                    flashcards_to_create.append(
                    Flashcard(
                        lesson=lesson,
                        flashcard_question=question,
                        flashcard_answer=answer,
                        flashcard_image=image  # This can be None if no image is uploaded
                    ))
            Flashcard.objects.bulk_create(flashcards_to_create)
            return redirect("Redirect Module Page", module_id=module_id)
        except Exception as e:
            return HttpResponse('Error')
    return render(request, 'main/course/lesson_flashcard/add_flashcard.html', {'module_id': module_id})
  

@permission_required("main.delete_course",login_url="/", raise_exception=True)
def delete_course(request):
     return delete_object(request, app_label='main', model_name='Course', object_id='course_id')

@permission_required("main.delete_module",login_url="/", raise_exception=True)
def delete_module(request):
    return delete_object(request, app_label='main', model_name='Module', object_id='module_id')

@permission_required("main.delete_flashcard",login_url="/", raise_exception=True)
def delete_flashcard(request):
    return delete_object(request, app_label='main', model_name='Flashcard', object_id='flashcard_id')

@permission_required("main.delete_quiz",login_url="/", raise_exception=True)
def delete_quiz(request):
    return delete_object(request, app_label='main', model_name="Quiz", object_id='quiz_id')


#QUIZZZZZ 


# Create an inline formset for the questions in the quiz
QuestionFormSet = inlineformset_factory(
    Quiz,  # Parent model
    Question,  # Related model
    form=AddQuestionForm, 
    extra=1,  
    can_delete=True,  
)

@permission_required(
    ("main.add_quiz", "main.add_question", "main.add_quiz"), 
    login_url="/", 
    raise_exception=True
)

def add_quiz(request, module_id):
    if request.method == "POST":
        data = request.POST
        try:
           
             # Extract question data
            question_texts = data.getlist("question_text[]")
            question_types = data.getlist("question_type[]")
            choices_list = data.getlist("choices[]")
            correct_answers = data.getlist("correct_answer[]")
            points = data.getlist("question_point[]")
            question_time_limit_set=data.getlist("question_time_limit[]")
            print(question_time_limit_set)
            question_time_limit = [None if not value else value for value in question_time_limit_set]
            print(question_time_limit)
            # Validate that at least one question exists
            if not question_texts or len(question_texts) == 0:
                return HttpResponse("Error: At least one question is required.", status=400)

            # Create the Quiz
            with transaction.atomic():
             quiz = Quiz.objects.create(
                quiz_title=data.get("quiz_title"),
                quiz_description=data.get("quiz_description"),
                attempts_allowed=data.get("attempts_allowed") or None,    
                time_limit=data.get("time_limit") or None,
                total_mark=data.get("total_mark"),
                module=get_object_or_404(Module, id=module_id),
                quiz_creator=request.user,
            )
            
            for i in range(len(question_texts)):
                choices = choices_list[i] if question_types[i] == "MCQ" else None
                Question.objects.create(
                    quiz=quiz,
                    question_text=question_texts[i],
                    question_type=question_types[i],
                    choices=choices,
                    correct_answer=correct_answers[i],
                    question_point=points[i],
                    question_time_limit=question_time_limit[i] 
                )
            return redirect('Redirect Module Page', module_id=module_id)

        except Exception as e:
              return HttpResponse('Error')

    return render(request, "main/course/quiz/add_quiz.html", {"module_id": module_id})


@login_required(login_url='/')
def quiz(request, quiz_id):
    quiz = get_object_or_404(
        Quiz.objects.prefetch_related(
            'quiz_attempts',  
            'questions'     
        ), id=quiz_id
    )
    user = request.user  
    attempts = quiz.quiz_attempts.filter(taken_by=user).count()
    questions = quiz.questions.all()
    if quiz.attempts_allowed is None or attempts < quiz.attempts_allowed:
        if request.method == 'POST':
            answers = []
            final_score = 0
            for question in questions:
                try:
                    answer_value = request.POST.get(f'question_{question.id}')
                    is_correct = answer_value == question.correct_answer
                    if is_correct:
                      final_score += question.question_point
                    answer = Answer(
                            answered_by=user,
                            question=question,
                            answer_text=answer_value,
                            is_correct=is_correct
                        )
                    answers.append(answer)
                except Exception as e:
                    print(f"Error saving answer for {question.id}: {e}")
            if answers:
                Answer.objects.bulk_create(answers)
            QuizAttempt.objects.create(taken_by=user, quiz=quiz, score=final_score, attempts_taken=attempts+1)
            return redirect('Quiz Results', quiz_id=quiz_id)
        
        AnswerFormSet = modelformset_factory(Answer, form=AddAnswerForm, extra=0)
        formset = AnswerFormSet(queryset=Answer.objects.none())
        return render(request, 'main/course/quiz/quiz_page.html', {
            'quiz': quiz,
            'formset': formset,
        })
    return JsonResponse({'message': 'You exceeded the allowed quiz attempts.'})

