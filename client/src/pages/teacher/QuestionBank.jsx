import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    difficulty: '',
    tags: '',
    classId: ''
  });

  const [formData, setFormData] = useState({
    questionText: '',
    questionType: 'mcq',
    options: ['', '', '', ''],
    correctAnswers: [''],
    difficulty: 'easy',
    tags: [],
    points: 1,
    classId: ''
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    let filtered = questions.filter(question => {
      if (filters.search && !question.questionText.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.difficulty && question.difficulty !== filters.difficulty) return false;
      if (filters.tags) {
        const tagFilter = filters.tags.split(',').map(tag => tag.trim().toLowerCase());
        const questionTags = question.tags.map(tag => tag.toLowerCase());
        if (!tagFilter.some(tag => questionTags.includes(tag))) return false;
      }
      return true;
    });

    setFilteredQuestions(filtered);
  }, [questions, filters]);

  const fetchQuestions = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.tags) params.append('tags', filters.tags);
      if (filters.classId) params.append('classId', filters.classId);
      if (filters.search) params.append('search', filters.search);

      const response = await api.get(`/exam/questions?${params}`);
      setQuestions(response.data);
    } catch (error) {
      toast.error('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const resetForm = () => {
    setFormData({
      questionText: '',
      questionType: 'mcq',
      options: ['', '', '', ''],
      correctAnswers: [''],
      difficulty: 'easy',
      tags: [],
      points: 1,
      classId: ''
    });
    setEditingQuestion(null);
  };

  const openModal = (question = null) => {
    if (question) {
      setEditingQuestion(question);
      setFormData({
        questionText: question.questionText,
        questionType: question.questionType,
        options: question.options || ['', '', '', ''],
        correctAnswers: question.correctAnswers,
        difficulty: question.difficulty,
        tags: question.tags,
        points: question.points,
        classId: question.classId || ''
      });
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        tags: formData.tags.filter(tag => tag.trim() !== ''),
        options: formData.questionType === 'mcq' || formData.questionType === 'multiple'
          ? formData.options.filter(option => option.trim() !== '')
          : []
      };

      if (editingQuestion) {
        await api.put(`/exam/questions/${editingQuestion._id}`, submitData);
        toast.success('Question updated successfully!');
      } else {
        await api.post('/exam/questions', submitData);
        toast.success('Question created successfully!');
      }

      fetchQuestions();
      closeModal();
    } catch (error) {
      toast.error(editingQuestion ? 'Failed to update question' : 'Failed to create question');
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await api.delete(`/exam/questions/${questionId}`);
      toast.success('Question deleted successfully!');
      fetchQuestions();
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleTagChange = (value) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    setFormData({ ...formData, tags });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div>
        <LoadingSkeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded shadow">
              <LoadingSkeleton className="h-6 w-full mb-2" />
              <LoadingSkeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Question Bank</h1>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Question
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search questions..."
            value={filters.search}
            onChange={(e) => handleFilterChange({ ...filters, search: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <select
            value={filters.difficulty}
            onChange={(e) => handleFilterChange({ ...filters, difficulty: e.target.value })}
            className="border rounded px-3 py-2"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <input
            type="text"
            placeholder="Filter by tags (comma separated)"
            value={filters.tags}
            onChange={(e) => handleFilterChange({ ...filters, tags: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <button
            onClick={fetchQuestions}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Questions List */}
      {filteredQuestions.length === 0 ? (
        <p className="text-gray-600">No questions match the current filters.</p>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <div key={question._id} className="bg-white p-6 rounded shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                      {question.difficulty}
                    </span>
                    <span className="text-sm text-gray-600">
                      {question.questionType.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-600">
                      {question.points} point{question.points !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="text-lg mb-2">{question.questionText}</p>
                  {question.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {question.tags.map((tag, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {(question.questionType === 'mcq' || question.questionType === 'multiple') && question.options && (
                    <div className="space-y-1">
                      {question.options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <span className="text-sm font-medium">{String.fromCharCode(65 + index)}.</span>
                          <span className="text-sm">{option}</span>
                          {question.correctAnswers.includes(option) && (
                            <span className="text-green-600 text-sm font-medium">✓ Correct</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {question.questionType === 'text' && (
                    <p className="text-sm text-gray-600">Correct Answer: {question.correctAnswers[0]}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => openModal(question)}
                    className="bg-yellow-600 text-white px-3 py-2 rounded hover:bg-yellow-700 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(question._id)}
                    className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingQuestion ? 'Edit Question' : 'Add New Question'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Question Text *</label>
                <textarea
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  className="w-full border rounded px-3 py-2 h-24"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Question Type *</label>
                  <select
                    value={formData.questionType}
                    onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="mcq">Multiple Choice (Single)</option>
                    <option value="multiple">Multiple Choice (Multiple)</option>
                    <option value="text">Text Answer</option>
                    <option value="code">Code Answer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty *</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full border rounded px-3 py-2"
                    required
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              {(formData.questionType === 'mcq' || formData.questionType === 'multiple') && (
                <div>
                  <label className="block text-sm font-medium mb-1">Options *</label>
                  {formData.options.map((option, index) => (
                    <input
                      key={index}
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      className="w-full border rounded px-3 py-2 mb-2"
                      required
                    />
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">
                  Correct Answer{formData.questionType === 'multiple' ? 's (comma separated)' : ''} *
                </label>
                <input
                  type="text"
                  value={formData.correctAnswers.join(', ')}
                  onChange={(e) => setFormData({
                    ...formData,
                    correctAnswers: e.target.value.split(',').map(ans => ans.trim()).filter(ans => ans !== '')
                  })}
                  className="w-full border rounded px-3 py-2"
                  placeholder={formData.questionType === 'multiple' ? 'A, C' : 'Correct answer'}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={(e) => handleTagChange(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                    placeholder="math, algebra, geometry"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Points *</label>
                  <input
                    type="number"
                    value={formData.points}
                    onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 1 })}
                    className="w-full border rounded px-3 py-2"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editingQuestion ? 'Update Question' : 'Create Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBank;
