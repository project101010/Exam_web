import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../../components/LoadingSkeleton';
import ExamFilters from '../../components/ExamFilters';
import ExamPreviewModal from '../../components/ExamPreviewModal';
import { useClass } from '../../context/ClassContext';

const ManageExams = () => {
  const { classes } = useClass();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    classId: '',
    status: '',
    sortBy: 'createdAt'
  });
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    let filtered = exams.filter(exam => {
      if (filters.search && !exam.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.classId && exam.class._id !== filters.classId) return false;
      if (filters.status) {
        if (filters.status === 'published' && !exam.isPublished) return false;
        if (filters.status === 'draft' && exam.isPublished) return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      if (filters.sortBy === 'title') return a.title.localeCompare(b.title);
      if (filters.sortBy === 'duration') return a.duration - b.duration;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    setFilteredExams(filtered);
  }, [exams, filters]);

  const fetchExams = async () => {
    try {
      const response = await api.get('/exam/teacher/exams');
      setExams(response.data);
    } catch (error) {
      toast.error('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (examId) => {
    try {
      await api.post(`/exam/teacher/publish/${examId}`);
      toast.success('Exam published!');
      fetchExams();
    } catch (error) {
      toast.error('Failed to publish exam');
    }
  };

  const handleUnpublish = async (examId) => {
    try {
      await api.post(`/exam/teacher/unpublish/${examId}`);
      toast.success('Exam unpublished!');
      fetchExams();
    } catch (error) {
      toast.error('Failed to unpublish exam');
    }
  };

  const handleSchedule = async (examId, scheduledAt) => {
    try {
      await api.post(`/exam/teacher/schedule/${examId}`, { scheduledAt });
      toast.success('Exam scheduled!');
      fetchExams();
    } catch (error) {
      toast.error('Failed to schedule exam');
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm('Are you sure you want to delete this exam? This action cannot be undone.')) return;
    try {
      await api.delete(`/exam/teacher/exam/${examId}`);
      toast.success('Exam deleted!');
      fetchExams();
    } catch (error) {
      toast.error('Failed to delete exam');
    }
  };

  const handlePreview = (exam) => {
    setSelectedExam(exam);
    setShowPreviewModal(true);
  };

  const handleDuplicate = async (examId) => {
    try {
      await api.post(`/exam/teacher/duplicate/${examId}`);
      toast.success('Exam duplicated!');
      fetchExams();
    } catch (error) {
      toast.error('Failed to duplicate exam');
    }
  };

  const handleUpdate = (examId) => {
    navigate(`/teacher/create-exam?examId=${examId}`);
  };

  if (loading) {
    return (
      <div>
        <LoadingSkeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded shadow">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <LoadingSkeleton className="h-6 w-32" />
                  <LoadingSkeleton className="h-4 w-24" />
                  <LoadingSkeleton className="h-4 w-28" />
                  <LoadingSkeleton className="h-4 w-20" />
                  <LoadingSkeleton className="h-4 w-16" />
                </div>
                <div className="space-y-2">
                  <LoadingSkeleton className="h-8 w-20" />
                  <LoadingSkeleton className="h-8 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Manage Exams</h1>

      <ExamFilters filters={filters} onFilterChange={setFilters} classes={classes} />

      {filteredExams.length === 0 ? (
        <p className="text-gray-600">No exams match the current filters.</p>
      ) : (
        <div className="space-y-4">
          {filteredExams.map((exam) => (
            <div key={exam._id} className="bg-white p-4 md:p-6 rounded shadow">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-lg md:text-xl font-semibold">{exam.title}</h3>
                  <p className="text-gray-600">Class: {exam.class.title}</p>
                  <p className="text-gray-600">Duration: {exam.duration} minutes</p>
                  <p className="text-gray-600">Pass Percentage: {exam.passPercentage}%</p>
                  <p className="text-gray-600">Status: {exam.isPublished ? 'Published' : 'Draft'}</p>
                  {exam.scheduledAt && (
                    <p className="text-gray-600">Scheduled: {new Date(exam.scheduledAt).toLocaleString()}</p>
                  )}
                </div>
                <div className="flex flex-col items-start md:items-end space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handlePreview(exam)}
                      className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleUpdate(exam._id)}
                      className="bg-yellow-600 text-white px-3 py-2 rounded hover:bg-yellow-700 text-sm"
                    >
                      Update
                    </button>
                    <button
                      onClick={() => handleDuplicate(exam._id)}
                      className="bg-purple-600 text-white px-3 py-2 rounded hover:bg-purple-700 text-sm"
                    >
                      Duplicate
                    </button>
                    {!exam.isPublished ? (
                      <button
                        onClick={() => handlePublish(exam._id)}
                        className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm"
                      >
                        Publish
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnpublish(exam._id)}
                        className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm"
                      >
                        Unpublish
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(exam._id)}
                      className="bg-red-800 text-white px-3 py-2 rounded hover:bg-red-900 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                  <input
                    type="datetime-local"
                    onChange={(e) => handleSchedule(exam._id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm w-full md:w-auto"
                    placeholder="Schedule exam"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showPreviewModal && selectedExam && (
        <ExamPreviewModal
          exam={selectedExam}
          onClose={() => {
            setShowPreviewModal(false);
            setSelectedExam(null);
          }}
        />
      )}
    </div>
  );
};

export default ManageExams;
