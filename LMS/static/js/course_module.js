function toggleDeleteButton(event) {
    const dropdownMenu = event.target.closest('.module-item').querySelector('.dropdown-menu');
    dropdownMenu.style.display =
      dropdownMenu.style.display === 'none' || dropdownMenu.style.display === '' ? 'block' : 'none';
  }
  

  document.addEventListener('DOMContentLoaded', function () {
    const timedQuizLinks = document.querySelectorAll('a.timed-quiz');
    
    timedQuizLinks.forEach(function(link) {
      link.addEventListener('click', function(event) {
        event.preventDefault();
        const quizId = this.getAttribute('data-quiz-id');
        const quizTitle = this.getAttribute('data-quiz-title');
        const confirmAction = confirm(`This is a timed quiz: "${quizTitle}". The timer countdown will start running when the quiz loads. Are you sure you want to enter?`);
        
        if (confirmAction) {
          window.location.href = `/quiz/${quizId}`;  
        }
      });
    });
  });
  