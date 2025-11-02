import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useClass } from '../../context/ClassContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ClassDetail = () => {
  const { classId } = useParams();
  const { classes, approveStudent, rejectStudent, bulkApproveStudents, bulkRejectStudents, deleteRejectedStudents, loading, fetchClasses } = useClass();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('');
  const [selectedExamFilter, setSelectedExamFilter] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('csv');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await api.get('/exam/teacher/exams');
        const classExams = response.data.filter(exam => exam.class === classId);
        setExams(classExams);
      } catch (error) {
        console.error('Failed to fetch exams', error);
      }
    };
    if (classId) {
      fetchExams();
    }
  }, [classId]);

  const cls = classes.find(c => c._id === classId);
  if (!cls) return <p>Class not found</p>;

  const filteredStudents = cls.students.filter(student => {
    const matchesSearch = student.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSelectStudent = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.student._id));
    }
  };

  const handleBulkApprove = () => {
    if (selectedStudents.length > 0) {
      bulkApproveStudents(classId, selectedStudents);
      setSelectedStudents([]);
    }
  };

  const handleBulkReject = () => {
    if (selectedStudents.length > 0) {
      bulkRejectStudents(classId, selectedStudents);
      setSelectedStudents([]);
    }
  };

  const handleApprove = (studentId) => {
    approveStudent(classId, studentId);
  };

  const handleReject = (studentId) => {
    rejectStudent(classId, studentId);
  };

  const handleDeleteRejected = () => {
    deleteRejectedStudents(classId);
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedStudentFilter) params.append('studentId', selectedStudentFilter);
      if (selectedExamFilter) params.append('examId', selectedExamFilter);
      if (selectedFormat) params.append('format', selectedFormat);

      const response = await api.get(`/class/teacher/export-class-data/${classId}?${params.toString()}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${cls.title}-data.${selectedFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Class data exported successfully');
    } catch (error) {
      console.error('Export failed', error);
      toast.error('Failed to export class data');
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(`/class/teacher/import-students/${classId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success(response.data.message);
      // Refresh the class data
      fetchClasses();
    } catch (error) {
      console.error('Import failed', error);
      toast.error(error.response?.data?.message || 'Failed to import students');
    }
  };

  const handleExportGradebook = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedStudentFilter) params.append('studentId', selectedStudentFilter);
      if (selectedExamFilter) params.append('examId', selectedExamFilter);
      if (selectedFormat) params.append('format', selectedFormat);

      const response = await api.get(`/exam/teacher/export-gradebook/${classId}?${params.toString()}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${cls.title}-gradebook.${selectedFormat}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Gradebook exported successfully');
    } catch (error) {
      console.error('Export failed', error);
      toast.error('Failed to export gradebook');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">{cls.title} - Class Detail</h2>
      <p className="mb-4">Class Code: <span className="font-mono">{cls.classCode}</span></p>

      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Search students by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="p-2 border rounded flex-grow"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <button
          onClick={handleDeleteRejected}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete All Rejected
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 items-center">
        <h3 className="text-lg font-semibold">Export Filters:</h3>
        <select
          value={selectedStudentFilter}
          onChange={(e) => setSelectedStudentFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Students</option>
          {cls.students.map(student => (
            <option key={student.student._id} value={student.student._id}>
              {student.student.name} ({student.student.email})
            </option>
          ))}
        </select>
        <select
          value={selectedExamFilter}
          onChange={(e) => setSelectedExamFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Exams</option>
          {exams.map(exam => (
            <option key={exam._id} value={exam._id}>
              {exam.title}
            </option>
          ))}
        </select>
        <select
          value={selectedFormat}
          onChange={(e) => setSelectedFormat(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="csv">CSV</option>
          <option value="pdf">PDF</option>
        </select>
        <button
          onClick={handleExport}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Export Class Data ({selectedFormat.toUpperCase()})
        </button>
        <button
          onClick={handleExportGradebook}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Export Gradebook ({selectedFormat.toUpperCase()})
        </button>
        <label className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer">
          Import Students
          <input
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>

      {selectedStudents.length > 0 && (
        <div className="mb-4 flex gap-2">
          <button
            onClick={handleBulkApprove}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Bulk Approve ({selectedStudents.length})
          </button>
          <button
            onClick={handleBulkReject}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Bulk Reject ({selectedStudents.length})
          </button>
        </div>
      )}

      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={selectedStudents.length === filteredStudents.length && filteredStudents.length > 0}
            onChange={handleSelectAll}
            className="mr-2"
          />
          Select All ({filteredStudents.length} students)
        </label>
      </div>

      <ul className="space-y-2">
        {filteredStudents.length === 0 ? (
          <p>No students match the criteria.</p>
        ) : (
          filteredStudents.map(student => (
            <li key={student.student._id} className="flex justify-between items-center p-2 border rounded">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.student._id)}
                  onChange={() => handleSelectStudent(student.student._id)}
                  className="mr-4"
                />
                <div>
                  <span className="font-medium">{student.student.name}</span> ({student.student.email})
                  <span className={`ml-4 px-2 py-1 rounded text-xs ${
                    student.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    student.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {student.status}
                  </span>
                </div>
              </div>
              <div className="space-x-2">
                {student.status !== 'approved' && (
                  <button
                    onClick={() => handleApprove(student.student._id)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Approve
                  </button>
                )}
                {student.status !== 'rejected' && (
                  <button
                    onClick={() => handleReject(student.student._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                  >
                    Reject
                  </button>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default ClassDetail;