function toggleDeleteButton(event) {
    const dropdownMenu = event.target.closest('.module-item').querySelector('.dropdown-menu');
    dropdownMenu.style.display =
      dropdownMenu.style.display === 'none' || dropdownMenu.style.display === '' ? 'block' : 'none';
  }
  
