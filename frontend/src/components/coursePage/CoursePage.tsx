import React, { useMemo, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCourseContext } from "../../context/CourseContext";
import { useModuleContext } from "../../context/ModuleContext";
import { useEditButtonContext } from "../../context/EditButtonContext";
import "../../styles/Course&LessonPage.css";
import DropdownMenu from "../DropdownMenu";
import AddModuleBox from "./AddModuleBox";
import { useNavigate } from "react-router-dom";
import BaseWrapper from "../base/BaseWrapper";

const CoursePage: React.FC = () => {
  const { courses, loading: courseLoading, error } = useCourseContext();

  const { courseId } = useParams<{ courseId: string }>();
  const {
    modules,
    fetchModules,
    loading: moduleLoading,
    error: moduleError,
    deleteModule,
  } = useModuleContext();

  const { editButton } = useEditButtonContext();

  const navigate = useNavigate();

  useEffect(() => {
    fetchModules(Number(courseId));
  }, [courseId, fetchModules]);

  const course = useMemo(() => {
    return courses?.find((c) => c.id === parseInt(courseId!, 10));
  }, [courses, courseId]);

  if (courseLoading) {
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
              {editButton && (
                <p className="text-muted ">
                  <strong>Created by: </strong>
                  {`${course.creator.first_name} ${course.creator.last_name}`}
                </p>
              )}
            </div>
          </div>

          {moduleLoading ? (
            <div>Loading lessons...</div>
          ) : moduleError ? (
            <div>Error: {moduleError}</div>
          ) : modules && modules.length > 0 ? (
            modules.map((module) => (
              <div
                className="modules-box shadow-sm rounded mb-4"
                key={module.id}
              >
                <ul className="list-unstyled">
                  <li className="module-item d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div
                        className="module-image"
                        onClick={() => {
                          navigate(`/course/${course.id}/module/${module.id}`);
                        }}
                      >
                        <img
                          src={String(module.module_image)}
                          className="module-img"
                          alt={module.module_title}
                        />
                      </div>
                      <div className="module-details">
                        <strong>{module.module_title}</strong>
                        <p>{module.topic}</p>
                      </div>
                    </div>

                    {editButton && (
                      <div className="dropdownmenu">
                        <DropdownMenu
                          buttonContent={"⋮"}
                          options={[
                            {
                              label: "Delete",
                              action: () => {
                                deleteModule(module.id);
                              },
                            },
                          ]}
                        />
                      </div>
                    )}
                  </li>
                </ul>
              </div>
            ))
          ) : (
            <p>No lessons available for this course.</p>
          )}
          {editButton && courseId !== undefined && (
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

const CoursePageWrapper: React.FC = () => {
  const { isStaff, isInstructor } = useCourseContext();
  return (
    <BaseWrapper
      options={[{ link: "/courses", label: "Home" }]}
      conditions={[{ isUserStaff: isStaff, isUserInstructor: isInstructor }]}
    >
      <CoursePage />
    </BaseWrapper>
  );
};

export default CoursePageWrapper;
