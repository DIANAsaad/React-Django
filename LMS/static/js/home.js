
  function toggleContent(event) {
    const cardBody = event.target.closest('.card-body');
    cardBody.classList.toggle('expanded');
  }

  window.onload = function () {
    const cards = document.querySelectorAll('.card-body');
    cards.forEach(card => {
      const cardText = card.querySelector('.card-text');
      const ellipsis = card.querySelector('.ellipsis');
      if (cardText.scrollHeight > cardText.clientHeight) {
        ellipsis.classList.add('show');
      }
    });
  };

  function toggleDeleteButton(event) {
    const deleteButton = event.target.closest('.card-body').querySelector('.delete-btn');
    deleteButton.style.display =
      deleteButton.style.display === 'none' || deleteButton.style.display === '' ? 'inline-block' : 'none';
  }

