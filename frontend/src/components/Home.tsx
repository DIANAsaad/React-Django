import React from "react";
import CourseCard from "./home/CourseCard";
import { useCourseContext } from "../context/CourseContext";
import "../styles/Home.css";
import AddCourseCard from "./home/AddCourseCard";
import BaseWrapper from "./base/BaseWrapper";
import { useEditButtonContext } from "../context/EditButtonContext";

const Home: React.FC = () => {
  const { courses, loading, error,} = useCourseContext();
  const { editButton } = useEditButtonContext();
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
        {(editButton) && (
          <div className="col-md-4">
            <AddCourseCard />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <div className="row">
        {courses &&
          courses.map((course) => (
            <div className="col-md-4" key={course.id}>
              <CourseCard course={course} />
            </div>
          ))}
        {(editButton) && (
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
    <BaseWrapper
      options={[{ link: "/*", label: "Dashboard" }]}
    >
      <Home />
    </BaseWrapper>
  );
};
export default HomeWrapper;
