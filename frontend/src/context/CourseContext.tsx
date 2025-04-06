import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

// Define the shape of a Course (adjust fields to match your API response)
export interface Course {
  id: number;
  course_title: string;
  creator: {
    first_name: string;
    last_name: string;
  };
  description: string;
  course_image: File | string;
  study_guide: string;
}

interface Enrollment {
  id: number;
  course_id: number;
  user: { id: number; first_name: string; last_name: string; email: string };
  enrolled_by: { first_name: string; last_name: string };
  enrolled_at: Date;
}

// Define the context structure
interface CourseContextProps {
  courses: Course[] | null;
  enrollments: Enrollment[] | null;
  deleteCourse: (courseId: number) => Promise<void>;
  addCourse: (
    course_name: string,
    description: string,
    course_image: File | null,
    study_guide: string
  ) => Promise<void>;
  enrollUser: ({
    course_id,
    user_id,
  }: {
    course_id: number;
    user_id: number | null;
  }) => Promise<void>;
  unenrollUser: (enrollment_id: number) => Promise<void>;
  fetchEnrollments: (courseId: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// Create the context
const CourseContext = createContext<CourseContextProps | undefined>(undefined);

const ENDPOINT = "http://localhost:8000";

const normalizeCourse = (course: Course) => ({
  ...course,
  course_image: course.course_image
    ? course.course_image?.toString().startsWith(ENDPOINT)
      ? course.course_image
      : `${ENDPOINT}${course.course_image}`
    : "/logo.png",
});

const normalizeCourses = (courses: Course[]) => {
  return courses.map(normalizeCourse);
};
// Provider component
export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken, registerSocketHandler } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${ENDPOINT}/courses`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setCourses(normalizeCourses(response.data.courses ?? []));
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

  const fetchEnrollments = useCallback(
    async (courseId: number) => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${ENDPOINT}/get_enrollments/${courseId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setEnrollments(response.data.enrollments);
      } catch {
        setError("Failed to fetch enrollments.");
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  const enrollUser = useCallback(
    async ({
      course_id,
      user_id,
    }: {
      course_id: number;
      user_id: number | null;
    }) => {
      if (!course_id || !user_id) {
        alert("Course and User are requiered to perfom enrollment");
        return;
      }

      try {
        setLoading(true);
        const formData = new FormData();
        formData.append("course_id", course_id.toString());
        if (user_id) formData.append("user_id", user_id.toString());
        await axios.post(`${ENDPOINT}/enroll_user`, formData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || "Unknown error";
        console.error(`Error enrolling user: ${errorMessage}`);
        alert(`An error occurred while enrolling user: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  const unenrollUser = useCallback(
    async (enrollment_id: number) => {
      try {
        setLoading(true);
        await axios.delete(`${ENDPOINT}/unenroll_user/${enrollment_id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.message || error.message || "Unknown error";
        console.error(`Error unenrolling user: ${errorMessage}`);
        alert(`An error occurred while unenrolling user: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    registerSocketHandler("enrollment_created", (message: any) => {
      setCourses((prevCourses) => [
        ...(prevCourses || []),
        normalizeCourse(message),
      ]);
    });
    registerSocketHandler("enrollment_details", (message: any) => {
      setEnrollments((prevEnrollments) => [
        ...(prevEnrollments || []),
        message,
      ]);
    });

    registerSocketHandler("enrollment_deleted", (message: any) => {
      setCourses((prevCourses) => [
        ...prevCourses.filter((c) => c.id !== message.id),
      ]);
    });
    registerSocketHandler("unenrollment_details", (message: any) => {
      setEnrollments((prevEnrollments) => [
        ...prevEnrollments.filter((e) => e.id !== message.id),
      ]);
    });
  }, []);

  return (
    <CourseContext.Provider
      value={{
        courses,
        enrollments,
        fetchEnrollments,
        enrollUser,
        unenrollUser,
        deleteCourse,
        addCourse,
        loading,
        error,
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
