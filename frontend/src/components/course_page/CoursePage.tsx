import React from "react";
import { useParams } from "react-router-dom";
import { useCourseContext } from "../../context/CourseContext";
import "../../styles/CoursePage.css";

const CoursePage: React.FC = () => {
  const { courses, loading, error } = useCourseContext();
  const { courseId } = useParams<{ courseId: string }>();

  const course = courses?.find((c) => c.id === parseInt(courseId!, 10));

  if (loading) {
    return <div>Loading course...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!course) {
    return <div>Course not found</div>;
  }

  return (
    <>
      <div className="row">
        <div className="container-cstm card-style mt-4" key={course.id}>
          <div className="course-info-box d-flex align-items-center p-4 mb-4 shadow-sm rounded">
            <div className="course-cstm-header">
              <img
                src={String(course.course_image)}
                className="card-cstm-img-top"
                alt={course.course_title}
              />
            </div>
            <div className="course-details ms-4">
              <h1 className="course-title">{course.course_title}</h1>
              <p className="text-muted ">{course.description}</p>
            </div>
          </div>
          {course.modules &&
            course.modules.map((module) => (
              <div
                className="modules-box p-4 shadow-sm rounded mb-4"
                id={`module-${module.id}`}
                key={module.id}
              >
                <ul className="list-unstyled">
                  <li className="module-item d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{module.module_title}</strong>: {module.topic}
                    </div>
                  </li>
                </ul>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};

export default CoursePage;