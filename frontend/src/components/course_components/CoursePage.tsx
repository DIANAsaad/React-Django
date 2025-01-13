import React, { useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCourseContext } from "../../context/CourseContext";
import { useModuleContext } from "../../context/ModuleContext";
import "../../styles/Course&LessonPage.css";
import DropdownMenu from "../DropdownMenu";
import AddModuleBox from "./AddModuleBox";

const CoursePage: React.FC = () => {
  const { courses, loading, error, canAddModule, isStaff } = useCourseContext();
  const { courseId } = useParams<{ courseId: string }>();
  const { modules, fetchModules } = useModuleContext();

  useEffect(() => {
    fetchModules(Number(courseId));
  }, [courseId, fetchModules]);

  const course = useMemo(() => {
    return courses?.find((c) => c.id === parseInt(courseId!, 10));
  }, [courses, courseId]);

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
        <div className="container-cstm card-style mt-4" key={courseId}>
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
              <p className="text-muted ">
                <strong>Created by: </strong>
                {`${course.creator.first_name} ${course.creator.last_name}`}
              </p>
            </div>
          </div>
          {modules &&
            modules.map((module) => (
              <div
                className="modules-box shadow-sm rounded mb-4"
                id={`module-${module.id}`}
                key={module.id}
              >
                <ul className="list-unstyled">
                  <li className="module-item d-flex">
                    <div className="module-image">
                      <img
                        src={String(module.module_image)}
                        className="module-img"
                      />
                    </div>
                    <div className="module-details">
                      <strong>{module.module_title}</strong>:
                      <p>{module.topic}</p>
                    </div>
                  </li>
                  <div className="dropdown-container">
                    <DropdownMenu
                      id={`module-${module.id}`}
                      options={[
                        {
                          label: "Delete",
                          action: () => {},
                        },
                      ]}
                    />
                  </div>
                </ul>
              </div>
            ))}
          {(isStaff || canAddModule) && courseId !== undefined && (
            <AddModuleBox courseId={Number(courseId)} />
          )}
          {course.study_guide && (
            <div
              className="material-box p-4 shadow-sm rounded"
              onClick={() => window.open(course.study_guide)}
            >
              <strong>Study Guide:</strong>
              Access you study guide here!
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CoursePage;
