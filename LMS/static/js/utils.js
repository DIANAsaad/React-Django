// deleteFunctions.js


function deleteItem(itemId, endpoint, itemType) {
  if (confirm(`Are you sure you want to delete this ${itemType}?`)) {
    const data = {
      [`${itemType}_id`]: itemId
    };
    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCSRFToken()  // Automatically using getCSRFToken from this file
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        if (response.ok) {
          console.log(`${itemType} with ID ${itemId} deleted successfully.`);
          document.getElementById(`${itemType}-${itemId}`).remove();
        } else {
          return response.json().then(data => {
            throw new Error(data.message || `Failed to delete the ${itemType}.`);
          });
        }
      })
      .catch(error => {
        console.error(`Error deleting ${itemType}:`, error);
        alert(`An error occurred while deleting the ${itemType}. Please try again.`);
      });
  }
}

function getCSRFToken() {
  const cookieValue = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];
  return cookieValue || ''; 
}