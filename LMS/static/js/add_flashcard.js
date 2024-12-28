document.addEventListener("DOMContentLoaded", () => {
    const addFlashcardBtn = document.getElementById("add-flashcard");
    const flashcardsContainer = document.getElementById("flashcards-container");
    const flashcardFormTemplate = document.getElementById("flashcard-form-template").innerHTML;
    const flashcardCountInput = document.getElementById("flashcard-count");
    let flashcardIndex = 0;

    // Function to add a new flashcard form
    const addFlashcard = () => {
        const newFlashcardForm = flashcardFormTemplate.replace(/__INDEX__/g, flashcardIndex);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newFlashcardForm.trim();
        flashcardsContainer.appendChild(tempDiv.firstChild);
        flashcardIndex++;
        flashcardCountInput.value = flashcardIndex;
    };

    // Event listener for adding a new flashcard
    addFlashcardBtn.addEventListener("click", addFlashcard);

    // Event listener for removing a flashcard
    flashcardsContainer.addEventListener("click", (event) => {
        if (event.target.classList.contains("remove-flashcard")) {
            const flashcardForm = event.target.closest(".flashcard-form");
            if (flashcardForm) {
                flashcardForm.remove();
                flashcardIndex--;

                // Update the hidden flashcard count input
                flashcardCountInput.value = flashcardIndex;
            }
        }
    });
});
