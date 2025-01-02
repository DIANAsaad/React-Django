import React, { useMemo } from "react";
import { useCourseContext } from "../../context/CourseContext";
import "../../styles/CourseCard.css";
import DropdownMenu from "../DropdownMenu";

// Function to handle the delete logic
const handleDelete = (componentId: number, endpoint: string, componentModel: string) => {
  if (window.confirm(`Are you sure you want to delete this ${componentModel}?`)) {
    const data = {
      [`${componentModel}_id`]: componentId
    };

    fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('access_token')}` // JWT token
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

const CourseCard: React.FC<{ courseId: number }> = ({ courseId }) => {
  const { courses } = useCourseContext();

  // Find the course based on the courseId
  const course = useMemo(
    () => courses?.find((c) => c.id === courseId),
    [courses, courseId]
  );

  if (!course) return null; // Handle cases where the course is not found

  return (
    <div className="col-12 mb-4" id={`course-${course.id}`}>
      <div className="card shadow-sm course-card">
        <div className="image-container position-relative">
          <img
            src={String(course.course_image)}
            className="card-img-top"
            alt={course.course_title}
          />
        </div>
        <div className="card-body p-2">
          <div className="d-flex justify-content-between align-items-start mb-1">
            <div className="course-info d-flex flex-column">
              <h5 className="course-title mb-0">{course.course_title}</h5>
              <small className="course-id">(ID: {course.id})</small>
            </div>
            <DropdownMenu
              id={`course-${course.id}`}
              options={[
                {
                  label: "Delete",
                  action: () => {
                    handleDelete(course.id, "/delete_course", "course");
                  }
                }
              ]}
            />
          </div>
          <p className="card-text text-muted mb-0">{course.description}</p>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
