document.addEventListener('DOMContentLoaded', () => {
  const flashcardBoxes = document.querySelectorAll('.flashcard-info-box');
  const nextFlashcardBtn = document.getElementById('next-flashcard');
  const previousFlashcardBtn = document.getElementById('previous-flashcard');
  const flashcardCount = flashcardBoxes.length;
  let flashcardIndex = 0;

  function previousFlashcard() {
    if (flashcardIndex > 0) {
      flashcardIndex--;
      // Enable the Next button since we're moving back
      nextFlashcardBtn.disabled = false;
    }

    // Disable the Previous button if we're at the first flashcard
    if (flashcardIndex === 0) {
      previousFlashcardBtn.disabled = true;
    }

    hideAllFlashcardsExcept(flashcardIndex);
    flipAllFlashCardsToQuestion();
  }

  function nextFlashcard() {
    if (flashcardIndex < flashcardCount - 1) {
      flashcardIndex++;
      // Enable the Previous button since we're moving forward
      previousFlashcardBtn.disabled = false;
    }

    // Disable the Next button if we're at the last flashcard
    if (flashcardIndex === flashcardCount - 1) {
      nextFlashcardBtn.disabled = true;
    }

    hideAllFlashcardsExcept(flashcardIndex);
    flipAllFlashCardsToQuestion();
  }


  nextFlashcardBtn.addEventListener('click', event => {
    nextFlashcard();
  });

  previousFlashcardBtn.addEventListener('click', event => {
    previousFlashcard();
  });

  flashcardBoxes.forEach(box => {
    box.addEventListener('click', event => {
      // If the user did *not* click on the orange question side, do nothing
      if (
        !event.target.classList.contains('flashcard-question') &&
        !event.target.classList.contains('flashcard-answer')
      ) {
        return;
      }

      const questionElement = box.querySelector('.question-side');
      const answerElement = box.querySelector('.answer-side');

      // Toggle the 'flipped' class on the flashcard box to activate the flip effect
      box.classList.toggle('flipped');

      // Toggle visibility of the question and answer
      if (box.classList.contains('flipped')) {
        // Show the answer and hide the question
        questionElement.style.display = 'none';
        answerElement.style.display = 'block';
      } else {
        // Show the question and hide the answer
        questionElement.style.display = 'block';
        answerElement.style.display = 'none';
      }
    });
  });

  function hideAllFlashcardsExcept(index) {
    flashcardBoxes.forEach((box, i) => {
      if (i !== index) {
        box.classList.add('d-none'); // Assuming 'd-none' hides the element
      } else {
        box.classList.remove('d-none');
      }
    });
  }

  function flipAllFlashCardsToQuestion() {
    flashcardBoxes.forEach(box => {
      const questionElement = box.querySelector('.question-side');
      const answerElement = box.querySelector('.answer-side');

      // Show the question and hide the answer
      questionElement.style.display = 'block';
      answerElement.style.display = 'none';

      // Remove the 'flipped' class to ensure the question is visible
      box.classList.remove('flipped');
    });
  }

  // Initialize the display by showing the first flashcard and setting button states
  hideAllFlashcardsExcept(0);
  previousFlashcardBtn.disabled = true; // Disable Previous button initially

  // Disable Next button if there's only one flashcard
  if (flashcardCount <= 1) {
    nextFlashcardBtn.disabled = true;
  }
});
