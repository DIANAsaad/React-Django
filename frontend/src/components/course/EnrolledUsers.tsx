import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCourseContext } from "../../context/CourseContext";
import BaseWrapper from "../base/BaseWrapper";
import "../../styles/EnrolledUsers.css";

const EnrollUser: React.FC = () => {
  const { enrollUser } = useCourseContext();
  const { fetchUsers, users } = useAuth(); // Initialize users as an empty array
  const { courseId } = useParams<{ courseId: string }>();
  const [formData, setFormData] = useState<{
    course_id: number;
    user_id: number | null;
  }>({
    course_id: Number(courseId),
    user_id: null,
  });

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, user_id: Number(e.target.value) });
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    await enrollUser(formData);
    setFormData({
      course_id: Number(courseId),
      user_id: null,
    });
  };

  return (
    <div className="enroll-user-container">
      <h2>Enroll User</h2>
      <form onSubmit={handleEnroll} className="enroll-form">
        <div className="form-group">
          <label htmlFor="user_id">Select User:</label>
          <select
            id="user_id"
            name="user_id"
            value={formData.user_id || ""}
            onChange={handleChange}
            required
          >
            <option value="" disabled>
              Select a user
            </option>
            {users?.map((user) => (
              <option key={user.id} value={user.id}>
                {`${user.first_name} ${user.last_name} (${user.email})`}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary">
          Enroll
        </button>
      </form>
    </div>
  );
};

const EnrolledUsers: React.FC = () => {
  const { enrollments, fetchEnrollments } = useCourseContext();
  const { courseId } = useParams<{ courseId: string }>();
  useEffect(() => {
    fetchEnrollments(Number(courseId));
  }, [fetchEnrollments, courseId]);

  return (
    <div className="enrolled-users-container">
      <h2>Enrolled Users</h2>
      <table className="enrolled-users-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>User Name</th>
            <th>User Email</th>
            <th>Enrolled By</th>
            <th>Enrolled At</th>
          </tr>
        </thead>
        <tbody>
          {enrollments?.map((enrollment) => (
            <tr key={enrollment.id}>
              <td>{enrollment.user.id}</td>
              <td>{`${enrollment.user.first_name} ${enrollment.user.last_name}`}</td>
              <td>{enrollment.user.email}</td>
              <td>{`${enrollment.enrolled_by.first_name} ${enrollment.enrolled_by.last_name}`}</td>
              <td>{new Date(enrollment.enrolled_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const EnrolledUsersWrapper: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();

  return (
    <BaseWrapper
      options={[
        { link: "/courses", label: "Home" },
        { link: `/course/${courseId}`, label: "Back to Course" },
      ]}
    >
      <EnrollUser />
      <EnrolledUsers />
    </BaseWrapper>
  );
};

export default EnrolledUsersWrapper;
