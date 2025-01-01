import React from "react";
import CourseCard from "./home_components/CourseCard";
import { useCourseContext } from "../context/CourseContext";

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
    <div className="container mt-4">
      <h1 className="mb-4">Available Courses</h1>
      <div className="row">
        {Array.isArray(courses) &&
          courses.map((course) => (
            <CourseCard courseId={course.id}/>
          ))}
      </div>
    </div>
  );
};

export default Home;



