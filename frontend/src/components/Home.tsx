import React from "react";
import CourseCard from "./homePage/CourseCard";
import { useCourseContext } from "../context/CourseContext";
import "../styles/Home.css";
import AddCourseCard from "./homePage/AddCourseCard";
import BaseWrapper from "./base/BaseWrapper";

const Home: React.FC = () => {
  const { courses, loading, error, isStaff, isInstructor } = useCourseContext();

  if (loading) {
    return <div>Loading courses...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!courses || courses.length === 0) {
    return (
      <>
        <div>No courses available</div>
        {(isStaff || isInstructor) && (
          <div className="col-md-4">
            <AddCourseCard />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="col-12 mb-4">
        <h2 className="d-flex">
          My Courses|
          <input
            type="text"
            className="custom-width"
            placeholder="Search courses..."
            id="course-search"
          />
        </h2>
      </div>
      <div className="row">
        {courses &&
          courses.map((course) => (
            <div className="col-md-4" key={course.id}>
              <CourseCard course={course} />
            </div>
          ))}
        {(isStaff || isInstructor) && (
          <div className="col-md-4">
            <AddCourseCard />
          </div>
        )}
      </div>
    </>
  );
};

const HomeWrapper: React.FC = () => {
  return (
    <BaseWrapper options={[{ link: "/*", label: "Dashboard" }]}>
      <Home />
    </BaseWrapper>
  );
};
export default HomeWrapper;
