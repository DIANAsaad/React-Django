import React from "react";
import CourseCard from "./home_components/CourseCard";
import { useCourseContext } from "../context/CourseContext";
import "../styles/Home.css";


const Home: React.FC = () => {
  const { courses, loading, error } = useCourseContext();

  if (loading) {
    return <div>Loading courses...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!courses || courses.length === 0) {
    return <div>No courses available</div>;
  }

  return (
    <>
      <div className="col-12 mb-4">
        <h2 className="d-flex">
          <span>My Courses |</span>
          <input
            type="text"
            className="form-control ms-2"
            placeholder="Search courses..."
            id="course-search"
          />
        </h2>
      </div>
      <div className="row">
        {courses &&
          courses.map((course) => (
            <CourseCard key={course.id} courseId={course.id} />
          ))}
      </div>
    </>
  );
};

export default Home;
