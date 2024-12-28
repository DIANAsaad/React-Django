function startTimer({ timeLimitInMinutes, displayId, onTimeUp = () => { } }) {
  let remainingTime = timeLimitInMinutes * 60; // Convert minutes to seconds

  const timerInterval = setInterval(function () {
    const minutes = Math.floor(remainingTime / 60);
    const seconds = remainingTime % 60;

    const displayEl = document.getElementById(displayId);
    if (displayEl) {
      displayEl.innerText = minutes + ':' + (seconds < 10 ? '0' + seconds : seconds);
    }

    if (remainingTime <= 0) {
      clearInterval(timerInterval);
      onTimeUp();
    } else {
      remainingTime--;
    }
  }, 1000);
}


function disableQuestionInputs(questionId) {
  const questionBox = document.querySelector(`[data-question-id="${questionId}"]`);
  const inputs = questionBox.querySelectorAll('input');
  if (!questionBox) {
    console.error(`No question box found for questionId "${questionId}"`);
    return;
  }
  inputs.forEach(input => {
    input.disabled = true;
  });
  // Find the checked input
  const checkedInput = questionBox.querySelector('input:checked');
  if (checkedInput) {
    const form = document.getElementById('quiz-form');
    if (form) {
      // Check if a hidden input already exists to avoid duplicates
      const existingHidden = form.querySelector(`input[name="${checkedInput.name}"][type="hidden"]`);
      if (!existingHidden) {
        // Create a hidden input with the same name and value
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = checkedInput.name;
        hiddenInput.value = checkedInput.value;
        form.appendChild(hiddenInput);
      }
    }
  }


  // Optionally, indicate that time is up for this question
  let timeUpMessage = questionBox.querySelector('.time-up-message');
  if (!timeUpMessage) {
    timeUpMessage = document.createElement('div');
    timeUpMessage.className = 'time-up-message text-danger mt-2';
    timeUpMessage.innerText = 'Time is up for this question.';
    questionBox.appendChild(timeUpMessage);
  }
}



window.onload = function () {
  const quizTimeLimitEl = document.getElementById('quiz-time-limit');

  if (quizTimeLimitEl) {
    const quizTimeLimit = parseInt(quizTimeLimitEl.innerText, 10);
    const submitButton = document.getElementById('submit-button');

    startTimer({
      timeLimitInMinutes: quizTimeLimit,
      displayId: 'time-remaining',
      onTimeUp: () => {
        if (submitButton) {
          submitButton.disabled = true;
        }

        alert("Time's up! Your answers have been submitted.");

        const quizForm = document.getElementById('quiz-form');
        if (quizForm) {
          quizForm.submit();
        }
      }
    });
  }

  // Add event listener to 'View Question' buttons for timed questions
  const confirmButtons = document.querySelectorAll('.confirm-question');
  confirmButtons.forEach(button => {
    button.addEventListener('click', handleViewQuestionClick);
  });
};



function handleViewQuestionClick(event) {
  const button = event.currentTarget;
  const questionBox = button.closest('.question-box');
  const questionId = questionBox.getAttribute('data-question-id');

  // Check if the question has already been toggled
  const alreadyToggled = document.getElementById(`question-toggled-${questionId}`);
  if (alreadyToggled) {
    return;
  }

  const questionTimeLimitEl = document.getElementById(`question-time-limit-${questionId}`);
  if (!questionTimeLimitEl) {
    console.error(`No element with id="question-time-limit-${questionId}" found.`);
    return;
  }

  const questionTimeLimit = parseInt(questionTimeLimitEl.innerText, 10);

  const confirmAction = confirm(
    `This is a timed question: The timer will start when you press OK.\n\nTime Limit: ${questionTimeLimit} ${questionTimeLimit === 1 ? 'Minute' : 'Minutes'
    }.\n\nAre you sure you want to enter?`
  );

  if (confirmAction) {
    // Start the timer for this question
    startTimer({
      timeLimitInMinutes: questionTimeLimit,
      displayId: `question-time-remaining-${questionId}`,
      onTimeUp: () => {
        disableQuestionInputs(questionId);
      }
    });

    // Hide the prompt and show the question
    const prompt = questionBox.querySelector('.question-timed-prompt');
    if (prompt) {
      prompt.style.display = 'none';
    }

    const questionContent = document.getElementById(`question-content-${questionId}`);
    if (questionContent) {
      questionContent.style.display = 'block';
    }

    // Mark the question as toggled to prevent multiple toggles
    saveToggledQuestion(questionBox, questionId);
  }
}

function saveToggledQuestion(questionBox, questionId) {
  const div = document.createElement('div');
  div.id = `question-toggled-${questionId}`;
  div.style.display = 'none';
  questionBox.appendChild(div);
}


const submitAnswerBtn = document.getElementById('submit-button');
const answerForm = document.getElementById('quiz-form');
answerForm.addEventListener("submit", (event) => {
  submitAnswerBtn.disabled = true;
});
