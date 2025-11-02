import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const ClassContext = createContext();

export const useClass = () => useContext(ClassContext);

export const ClassProvider = ({ children }) => {
  const { role, isAuthenticated } = useAuth();
  const [classes, setClasses] = useState([]);
  const [deletedClasses, setDeletedClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      fetchClasses();
      if (role === 'teacher') {
        fetchDeletedClasses();
      }
    }
  }, [isAuthenticated, role]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const endpoint = role === 'student' ? '/class/student/classes' : '/class/teacher/classes';
      const response = await api.get(endpoint);
      setClasses(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  const fetchDeletedClasses = async () => {
    try {
      const response = await api.get('/class/teacher/deleted-classes');
      setDeletedClasses(response.data || []);
    } catch (error) {
      toast.error('Failed to fetch deleted classes');
    }
  };

  const joinClass = async (classCode) => {
    try {
      await api.post('/class/student/join-class', { classCode });
      toast.success('Joined class successfully!');
      fetchClasses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join class');
    }
  };

  const createClass = async (title, description) => {
    setLoading(true);
    try {
      const response = await api.post('/class/teacher/create-class', { title, description });
      const newClass = response.data.class;
      setClasses(prev => [...prev, newClass]);
      toast.success(`Class created successfully! Class Code: ${newClass.classCode}`);
      return newClass;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create class');
    } finally {
      setLoading(false);
    }
  };

  const approveStudent = async (classId, studentId) => {
    try {
      await api.post(`/class/teacher/approve-student/${classId}`, { studentId });
      toast.success('Student approved!');
      fetchClasses();
    } catch (error) {
      toast.error('Failed to approve student');
    }
  };

  const rejectStudent = async (classId, studentId) => {
    try {
      await api.post(`/class/teacher/reject-student/${classId}`, { studentId });
      toast.success('Student rejected!');
      fetchClasses();
    } catch (error) {
      toast.error('Failed to reject student');
    }
  };

  const bulkApproveStudents = async (classId, studentIds) => {
    try {
      const response = await api.post(`/class/teacher/bulk-approve-students/${classId}`, { studentIds });
      toast.success(response.data.message);
      fetchClasses();
    } catch (error) {
      toast.error('Failed to bulk approve students');
    }
  };

  const bulkRejectStudents = async (classId, studentIds) => {
    try {
      const response = await api.post(`/class/teacher/bulk-reject-students/${classId}`, { studentIds });
      toast.success(response.data.message);
      fetchClasses();
    } catch (error) {
      toast.error('Failed to bulk reject students');
    }
  };

  const deleteRejectedStudents = async (classId) => {
    try {
      await api.delete(`/class/teacher/delete-rejected-students/${classId}`);
      toast.success('All rejected students deleted!');
      fetchClasses();
    } catch (error) {
      toast.error('Failed to delete rejected students');
    }
  };

  const deleteClass = async (classId) => {
    try {
      await api.delete(`/class/teacher/delete-class/${classId}`);
      toast.success('Class deleted successfully. It can be recovered within 2 days.');
      fetchClasses();
      if (role === 'teacher') fetchDeletedClasses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete class');
    }
  };

  const recoverClass = async (classId) => {
    try {
      await api.post(`/class/teacher/recover-class/${classId}`);
      toast.success('Class recovered successfully.');
      fetchClasses();
      fetchDeletedClasses();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to recover class');
    }
  };

  const updateClass = async (classId, title, description) => {
    try {
      const response = await api.put(`/class/teacher/update-class/${classId}`, { title, description });
      const updatedClass = response.data.class;
      setClasses(prev => prev.map(cls => cls._id === classId ? updatedClass : cls));
      toast.success('Class updated successfully!');
      return updatedClass;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update class');
      throw error;
    }
  };

  return (
    <ClassContext.Provider
      value={{
        classes,
        deletedClasses,
        loading,
        joinClass,
        createClass,
        approveStudent,
        rejectStudent,
        bulkApproveStudents,
        bulkRejectStudents,
        deleteRejectedStudents,
        deleteClass,
        recoverClass,
        updateClass,
        fetchClasses,
        fetchDeletedClasses,
      }}
    >
      {children}
    </ClassContext.Provider>
  );
};
