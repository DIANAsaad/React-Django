import React from "react";
import { useParams } from "react-router-dom";
import { useCourseContext } from "../../context/CourseContext";
import "../../styles/Course&LessonPage.css";
import AddModuleBox from "./AddModuleBox";

const CoursePage: React.FC = () => {
  const { courses, loading, error, canAddModule, isStaff } = useCourseContext();
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
          <div className="info-box d-flex align-items-center p-4 mb-4 shadow-sm rounded">
            <div className="cstm-header">
              <img
                src={String(course.course_image)}
                className="card-cstm-img-top"
                alt={course.course_title}
              />
            </div>
            <div className="details ms-4">
              <h1 className="title">{course.course_title}</h1>
              <p className="text-muted ">{course.description}</p>
              <p className="text-muted ">{`${course.creator.first_name} ${course.creator.last_name}`}</p>
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
          {course.study_guide && (
            <div
              className="material-box p-4 shadow-sm rounded"
              onClick={() => window.open(course.study_guide)}
            >
              <strong>Study Guide:</strong>
              Access you study guide here!
            </div>
          )}

{(isStaff || canAddModule) && courseId !== undefined && <AddModuleBox courseId={Number(courseId)} />}
        </div>
      </div>
    </>
  );
};

export default CoursePage;
