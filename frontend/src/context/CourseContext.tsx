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
  course_image: File | string;
  study_guide: string;
  modules: {
    id: number;
    module_title: string;
    topic: string;
    module_image: File | string;
  }[];
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
  isStaff: boolean;
  canDelete: boolean;
  canAdd: boolean;
}

// Create the context
const CourseContext = createContext<CourseContextProps | undefined>(undefined);

const ENDPOINT = "http://localhost:8000";

const normalizeCourse = (course: Course) => ({
  ...course,
  course_image: course.course_image
    ? `${ENDPOINT}${course.course_image}`
    : "/achieve_a_mark.png",
  modules: course.modules ?? [],
});

const normalizeCourses = (courses: Course[]) => {
  return courses.map(normalizeCourse);
};

// Provider component
export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken] = useLocalStorage("access_token", null);

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [canDelete, setCanDelete] = useState<boolean>(false);
  const [canAdd, setCanAdd] = useState<boolean>(false);

  useEffect(() => {
    // Fetch courses from your API
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${ENDPOINT}/courses`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        console.log(response.data);
        setCourses(normalizeCourses(response.data.courses ?? []));
        setIsStaff(response.data.isStaff);
        setCanDelete(response.data.canDelete);
        setCanAdd(response.data.canAdd);

      } catch {
        setError("Failed to fetch courses.");
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchCourses();
    }
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

        setCourses((prevCourses) => [
          ...prevCourses,
          normalizeCourse(response.data),
        ]);
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
    [accessToken]
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
      value={{
        courses,
        deleteCourse,
        addCourse,
        loading,
        error,
        isStaff,
        canDelete,
        canAdd,
      }}
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
