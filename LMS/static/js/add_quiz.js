const addQuestionBtn = document.getElementById("add-question");
const questionsContainer = document.getElementById("questions-container");
const questionTemplate = document.getElementById("question-template").content;
const quizForm = document.getElementById('quiz-form');
const submitQuizBtn = document.getElementById('submit-quiz');



quizForm.addEventListener("submit", (event) => {
  submitQuizBtn.disabled = true;
});


addQuestionBtn.addEventListener("click", () => {
  const newQuestion = questionTemplate.cloneNode(true);
  questionsContainer.appendChild(newQuestion);
});

questionsContainer.addEventListener("click", (event) => {
  if (event.target.classList.contains("remove-question")) {
    event.target.closest(".card").remove();
  }
});

// Handle question type changes
questionsContainer.addEventListener('change', event => {
  if (event.target.classList.contains('question-type-selector')) {
    const card = event.target.closest('.card');
    const questionType = event.target.value;
    const choicesContainer = card.querySelector('.choices-container');
    const correctAnswerSelect = card.querySelector('select[name="correct_answer[]"]');

    if (questionType === 'TF') {
      // Hide the choices container and make choices not required
      if (choicesContainer) {
        choicesContainer.style.display = 'none';
        const choicesInput = choicesContainer.querySelector('input[name="choices[]"]');
        if (choicesInput) choicesInput.removeAttribute('required');
      }

      // Set the correct answer options to True/False
      correctAnswerSelect.innerHTML = `
                  <option value="" disabled selected>Select an answer</option>
                  <option value="True">True</option>
                  <option value="False">False</option>
              `;
    } else if (questionType === 'MCQ') {
      // Show the choices container and require input again
      if (choicesContainer) {
        choicesContainer.style.display = 'block';
        const choicesInput = choicesContainer.querySelector('input[name="choices[]"]');
        if (choicesInput) choicesInput.setAttribute('required', 'required');
      }

      // Reset the correct answer select
      correctAnswerSelect.innerHTML = '<option value="" disabled selected>Select an answer</option>';
    }
  }
});

// Handle input changes to populate correct_answer[] for MCQs
questionsContainer.addEventListener('input', function (event) {
  if (event.target.name === 'choices[]') {
    const card = event.target.closest('.card');
    const questionTypeSelect = card.querySelector('select[name="question_type[]"]');
    const questionType = questionTypeSelect ? questionTypeSelect.value : 'MCQ';

    // Only populate if MCQ
    if (questionType === 'MCQ') {
      const choicesInput = event.target.value;
      const choicesArray = choicesInput.split(',').map(choice => choice.trim());

      const select = card.querySelector('select[name="correct_answer[]"]');
      if (select) {
        select.innerHTML = '<option value="" disabled selected>Select an answer</option>';

        choicesArray.forEach(function (choice) {
          const option = document.createElement('option');
          option.value = choice;
          option.textContent = choice;
          select.appendChild(option);
        });
      }
    }
  }
});
