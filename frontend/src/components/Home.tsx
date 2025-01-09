import React from "react";
import CourseCard from "./home_components/CourseCard";
import { useCourseContext } from "../context/CourseContext";
import "../styles/Home.css";
import AddCourseCard from "./home_components/AddCourseCard";

const Home: React.FC = () => {
  const { courses, loading, error, isStaff, canAdd} = useCourseContext();


  if (loading) {
    return <div>Loading courses...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!courses || courses.length === 0) {
    return (
      console.log(canAdd),
      <>
        <div>No courses available</div>
        {(isStaff || canAdd) &&(
        <div className="col-md-4">
          <AddCourseCard />
        </div>)}
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
          {(isStaff || canAdd) &&(
        <div className="col-md-4">
          <AddCourseCard />
        </div>)}
      </div>
    </>
  );
};

export default Home;
