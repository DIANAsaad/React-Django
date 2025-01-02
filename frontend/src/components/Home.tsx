import React from "react";
import CourseCard from "./home_components/CourseCard";
import { useCourseContext } from "../context/CourseContext";
import "../styles/Home.css";
import {DropdownMenu} from './dropdown-menu'
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
              <CourseCard courseId={course.id} />
            </div>
          ))}
      </div>
    </>
  );
};

export default Home;
