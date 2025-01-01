import React from "react";
import { useCourseContext } from "../../context/CourseContext";
import "../../styles/CourseCard.css";

const CourseCard: React.FC<{ courseId: number }> = ({ courseId }) => {
  const { courses } = useCourseContext();

  // Find the course based on the courseId
  const course = courses?.find((c) => c.id === courseId);
  
  if (!course) return null; // Handle cases where the course is not found

  const handleToggleContent = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering other click events
    console.log(`Details toggled for course ID: ${courseId}`);
  };

  return (
    <div
      className="col-12 mb-4 "
      id={`course-${course.id}`}
      onClick={() =>  console.log(`Course clicked: ${course.id}`)}
    >
      <div className="card shadow-sm course-card">
        <div className="image-container position-relative">
          {course.course_image ? (
            <img
              src={String(course.course_image) }
              className="card-img-top"
              alt={course.course_title}
            />
          ) : (
            <img
              src="/achieve_a_mark.png"
              className="card-img-top"
              alt="img"
            />
          )}
        </div>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="course-title">{course.course_title}</h5>
            <small className="course-id">(ID: {course.id})</small>
          </div>
          <p className="card-text text-muted">{course.description}</p>
          <span
            className="ellipsis text-primary"
            onClick={handleToggleContent}
            style={{ cursor: "pointer" }}
          >
            Show More
          </span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
