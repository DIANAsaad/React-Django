import React from "react";
import { Course, useCourseContext } from "../../context/CourseContext";
import "../../styles/CourseCard.css";
import DropdownMenu from "../DropdownMenu";
import { useNavigate } from "react-router-dom";

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
  const navigate= useNavigate();
  const { deleteCourse, isStaff, isInstructor } = useCourseContext();

  if (!course) return null;

  return (
    <div className='col-12 mb-4' key={course.id}>
    <div className='card shadow-sm course-card'>
      <div className='image-container position-relative'  onClick={()=>{navigate(`/coursePage/${course.id}`)}}>
        <img
          src={String(course.course_image)}
          className='card-img-top'
          alt={course.course_title}
        />
      </div>
      <div className='card-body p-2 position-relative'>
        <div className='course-info'>
          <h5 className='course-cstm-title mb-0'>{course.course_title}</h5>
          <small className='course-id'>(ID: {course.id})</small>
        </div>
        {(isStaff || 
        isInstructor) && (
          <div className="dropdown-container">
            <DropdownMenu
              buttonContent={"⋮"}
              options={[
                {
                  label: 'Delete',
                  action: () => {
                    deleteCourse(course.id);
                  },
                },
              ]}
            />
          </div>
        )}
        <p className='card-text text-muted mb-0'>{course.description}</p>
      </div>
    </div>
  </div>
  
  );
};

export default CourseCard;
