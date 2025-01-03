import React from 'react';
import { Course, useCourseContext } from '../../context/CourseContext';
import '../../styles/CourseCard.css';
import DropdownMenu from '../DropdownMenu';

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
  const { deleteCourse } = useCourseContext();

  if (!course) return null;

  return (
    <div className='col-12 mb-4' id={`course-${course.id}`}>
      <div className='card shadow-sm course-card'>
        <div className='image-container position-relative'>
          <img src={String(course.course_image)} className='card-img-top' alt={course.course_title} />
        </div>
        <div className='card-body p-2'>
          <div className='d-flex justify-content-between align-items-start mb-1'>
            <div className='course-info d-flex flex-column'>
              <h5 className='course-title mb-0'>{course.course_title}</h5>
              <small className='course-id'>(ID: {course.id})</small>
            </div>
            <DropdownMenu
              id={`course-${course.id}`}
              options={[
                {
                  label: 'Delete',
                  action: () => {
                    deleteCourse(course.id);
                  }
                }
              ]}
            />
          </div>
          <p className='card-text text-muted mb-0'>{course.description}</p>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
