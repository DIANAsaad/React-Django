import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import axios from "axios";
import useLocalStorage from "../hooks/use-local-storage";

// Define the shape of a Course (adjust fields to match your API response)
export interface Course {
  id: number;
  course_title: string;
  description: string;
  course_image: File;
  study_guide: string;
}

// Define the context structure
interface CourseContextProps {
  courses: Course[] | null;
  deleteCourse: (courseId: number) => Promise<void>;
  addCourse: (
    course_name: string,
    description: string,
    course_image: File | null,
    study_guide: string
  ) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Create the context
const CourseContext = createContext<CourseContextProps | undefined>(undefined);

const ENDPOINT = "http://localhost:8000";

// Provider component
export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken] = useLocalStorage("access_token", null);

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch courses from your API
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${ENDPOINT}/courses`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const updatedCourses = response.data.map((course: Course) => ({
          ...course,
          course_image: course.course_image
            ? `${ENDPOINT}${course.course_image}`
            : "/achieve_a_mark.png",
        }));

        setCourses(updatedCourses);
      } catch {
        setError("Failed to fetch courses.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [accessToken]);

  const addCourse = useCallback(
    async (
      course_title: string,
      description: string,
      course_image: File | null,
      study_guide: string
    ) => {
      try {
        const formData = new FormData();
        formData.append("course_title", course_title);
        formData.append("description", description);
        if (course_image) formData.append("course_image", course_image);
        formData.append("study_guide", study_guide);

        const response = await axios.post(`${ENDPOINT}/add_course`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${accessToken}`,
          },
        });

        setCourses((prevCourses) => [...prevCourses, response.data]);
      } catch (error: any) {
        console.error(
          `Error adding course:`,
          error.response?.data || error.message
        );
        alert(
          `An error occurred while adding the course: ${
            error.response?.data?.message || error.message
          }`
        );
      }
    },
    [accessToken, courses]
  );

  const deleteCourse = useCallback(
    async (courseId: number) => {
      const course = courses.find((c) => c.id === courseId);

      if (!course) {
        alert("Course not found");
        return;
      }

      try {
        await axios.delete(`${ENDPOINT}/delete_course/${courseId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        setCourses(courses.filter((c) => c.id !== courseId));
      } catch (error) {
        console.error(`Error deleting course:`, error);
        alert(`An error occurred while deleting the course. Please try again.`);
      }
    },
    [courses, accessToken]
  );

  return (
    <CourseContext.Provider
      value={{ addCourse, deleteCourse, courses, loading, error }}
    >
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
