import React from "react";

interface DeleteItemProps {
  componentId: number;
  endpoint: string;
  componentModel: string;
}

const DeleteItem: React.FC<DeleteItemProps> = ({ componentId, endpoint, componentModel }) => {
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete this ${componentModel}?`)) {
      const data = {
        [`${componentModel}_id`]: componentId
      };

      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}` // Pass the JWT token here
        },
        body: JSON.stringify(data)
      })
        .then(async (response) => {
          if (response.ok) {
            console.log(`${componentModel} with ID ${componentId} deleted successfully.`);
            const itemElement = document.getElementById(`${componentModel}-${componentId}`);
            if (itemElement) itemElement.remove();
          } else {
            const data = await response.json();
            throw new Error(data.message || `Failed to delete the ${componentModel}.`);
          }
        })
        .catch((error: Error) => {
          console.error(`Error deleting ${componentModel}:`, error);
          alert(`An error occurred while deleting the ${componentModel}. Please try again.`);
        });
    }
  };

  return (
    <button onClick={handleDelete} className="btn btn-danger">
      Delete {componentModel}
    </button>
  );
};

export default DeleteItem;
