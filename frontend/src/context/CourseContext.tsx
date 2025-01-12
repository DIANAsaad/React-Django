import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Define the shape of a Course (adjust fields to match your API response)
export interface Course {
  id: number;
  course_title: string;
  creator: {
    first_name: string;
    last_name:string;
  };
  description: string;
  course_image: File | string;
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
  isStaff: boolean;
  canDeleteCourse: boolean;
  canAddCourse: boolean;
  canAddModule: boolean;
  canDeleteModule: boolean;
}

// Create the context
const CourseContext = createContext<CourseContextProps | undefined>(undefined);

const ENDPOINT = 'http://localhost:8000';

const normalizeCourse = (course: Course) => ({
  ...course,
  course_image: course.course_image ? `${ENDPOINT}${course.course_image}` : '/achieve_a_mark.png',
});

const normalizeCourses = (courses: Course[]) => {
  return courses.map(normalizeCourse);
};

// Provider component
export const CourseProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [canDeleteCourse, setCanDeleteCourse] = useState<boolean>(false);
  const [canAddCourse, setCanAddCourse] = useState<boolean>(false);
  const [canDeleteModule, setCanDeleteModule] = useState<boolean>(false);
  const [canAddModule, setCanAddModule] = useState<boolean>(false);

  useEffect(() => {
    // Fetch courses from your API
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${ENDPOINT}/courses`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        setCourses(normalizeCourses(response.data.courses ?? []));
        setIsStaff(response.data.isStaff);
        setCanDeleteCourse(response.data.canDeleteCourse);
        setCanAddCourse(response.data.canAddCourse);
        setCanDeleteModule(response.data.canDeleteModule);
        setCanAddModule(response.data.canAddModule);
      } catch {
        setError('Failed to fetch courses.');
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchCourses();
    }
  }, [accessToken]);

  const addCourse = useCallback(
    async (course_title: string, description: string, course_image: File | null, study_guide: string) => {
      try {
        const formData = new FormData();
        formData.append('course_title', course_title);
        formData.append('description', description);
        if (course_image) formData.append('course_image', course_image);
        formData.append('study_guide', study_guide);
        const response = await axios.post(`${ENDPOINT}/add_course`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${accessToken}`
          }
        });

        setCourses(prevCourses => [...prevCourses, normalizeCourse(response.data)]);
      } catch (error: any) {
        console.error(`Error adding course:`, error.response?.data || error.message);
        alert(`An error occurred while adding the course: ${error.response?.data?.message || error.message}`);
      }
    },
    [accessToken]
  );

  const deleteCourse = useCallback(
    async (courseId: number) => {
      const course = courses.find(c => c.id === courseId);

      if (!course) {
        alert('Course not found');
        return;
      }

      try {
        await axios.delete(`${ENDPOINT}/delete_course/${courseId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });

        setCourses(courses.filter(c => c.id !== courseId));
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
        canDeleteCourse,
        canAddCourse, 
        canAddModule,
        canDeleteModule
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
    throw new Error('useCourseContext must be used within a CourseProvider');
  }
  return context;
};
