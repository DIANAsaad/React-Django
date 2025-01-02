import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import axios from "axios";

// Define the shape of a Course (adjust fields to match your API response)
interface Course {
  id: number;
  course_title: string;
  description: string;
  course_image: File;
}

// Define the context structure
interface CourseContextProps {
  courses: Course[] | null;
  loading: boolean;
  error: string | null;
}

// Create the context
const CourseContext = createContext<CourseContextProps | undefined>(undefined);

// Provider component
export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch courses from your API
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:8000/courses", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`, // Adjust token retrieval logic if necessary
          },
        });

        const updatedCourses = response.data.map((course: Course) => ({
          ...course,
          course_image: course.course_image
            ? `http://localhost:8000${course.course_image}`
            : "/achieve_a_mark.png",
        }));

        setCourses(updatedCourses);
      } catch (err) {
        setError("Failed to fetch courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <CourseContext.Provider value={{ courses, loading, error }}>
      {children}
    </CourseContext.Provider>
  );
};

// Custom hook for easier usage of the context
export const useCourseContext = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error("useCourseContext must be used within a CourseProvider");
  }
  return context;
};
