import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import QuestionRenderer from '../../components/QuestionRenderer';
import ExamPreviewModal from '../../components/ExamPreviewModal';
import { useClass } from '../../context/ClassContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CreateExam = () => {
  const { classes } = useClass();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const examId = searchParams.get('examId');
  const [exam, setExam] = useState({
    title: '',
    duration: 60,
    passPercentage: 50,
    instructions: '',
    classId: '',
    accessCode: '',
    sections: [{
      name: 'Section 1',
      instructions: '',
      questions: [],
      randomizeQuestions: false,
    }],
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState({
    questionText: '',
    questionType: 'mcq',
    options: ['', '', '', ''],
    correctAnswers: [''],
    difficulty: 'easy',
    tags: [],
    points: 1,
    media: null,
  });
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [showQuestionBank, setShowQuestionBank] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [questionBank, setQuestionBank] = useState([]);
  const [selectedSection, setSelectedSection] = useState(0);
  const [questionBankFilters, setQuestionBankFilters] = useState({
    search: '',
    difficulty: '',
    tags: ''
  });

  useEffect(() => {
    if (examId) {
      setIsEditing(true);
      const fetchExam = async () => {
        try {
          const response = await api.get(`/exam/teacher/preview/${examId}`);
          const examData = response.data;
          setExam({
            title: examData.title,
            duration: examData.duration,
            passPercentage: examData.passPercentage,
            instructions: examData.instructions || '',
            classId: examData.class?._id || '',
            accessCode: examData.accessCode || '',
            sections: examData.sections || [{
              name: 'Section 1',
              instructions: '',
              questions: examData.questions?.map(q => ({ ...q, id: q._id || Date.now() })) || [],
              randomizeQuestions: false,
            }],
          });
        } catch (error) {
          toast.error('Failed to load exam data');
        }
      };
      fetchExam();
    }
  }, [examId]);

  const fetchQuestionBank = async () => {
    try {
      const params = new URLSearchParams();
      if (questionBankFilters.difficulty) params.append('difficulty', questionBankFilters.difficulty);
      if (questionBankFilters.tags) params.append('tags', questionBankFilters.tags);
      if (questionBankFilters.search) params.append('search', questionBankFilters.search);
      if (exam.classId) params.append('classId', exam.classId);

      const response = await api.get(`/exam/questions?${params}`);
      setQuestionBank(response.data);
    } catch (error) {
      toast.error('Failed to fetch question bank');
    }
  };

  useEffect(() => {
    if (showQuestionBank) {
      fetchQuestionBank();
    }
  }, [showQuestionBank, questionBankFilters, exam.classId]);

  const handleExamChange = (e) => {
    const { name, value } = e.target;
    setExam({ ...exam, [name]: value });
  };

  const handleSectionChange = (sectionIndex, field, value) => {
    const newSections = [...exam.sections];
    newSections[sectionIndex][field] = value;
    setExam({ ...exam, sections: newSections });
  };

  const addSection = () => {
    const newSections = [...exam.sections, {
      name: `Section ${exam.sections.length + 1}`,
      instructions: '',
      questions: [],
      randomizeQuestions: false,
    }];
    setExam({ ...exam, sections: newSections });
  };

  const removeSection = (sectionIndex) => {
    if (exam.sections.length > 1) {
      const newSections = exam.sections.filter((_, index) => index !== sectionIndex);
      setExam({ ...exam, sections: newSections });
      if (selectedSection >= newSections.length) {
        setSelectedSection(newSections.length - 1);
      }
    }
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion({ ...currentQuestion, [name]: value });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const handleTagChange = (value) => {
    const tags = value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
    setCurrentQuestion({ ...currentQuestion, tags });
  };

  const addManualQuestion = async () => {
    if (!currentQuestion.questionText.trim()) {
      toast.error('Question text is required');
      return;
    }
    if ((currentQuestion.questionType === 'mcq' || currentQuestion.questionType === 'multiple') &&
        currentQuestion.options.some(opt => !opt.trim())) {
      toast.error('All options must be filled');
      return;
    }
    if (!currentQuestion.correctAnswers[0]?.trim()) {
      toast.error('Correct answer is required');
      return;
    }

    try {
      const questionData = {
        questionText: currentQuestion.questionText,
        questionType: currentQuestion.questionType,
        options: currentQuestion.questionType === 'mcq' || currentQuestion.questionType === 'multiple'
          ? currentQuestion.options.filter(opt => opt.trim() !== '')
          : [],
        correctAnswers: currentQuestion.correctAnswers.filter(ans => ans.trim() !== ''),
        difficulty: currentQuestion.difficulty,
        tags: currentQuestion.tags,
        points: currentQuestion.points,
        classId: exam.classId,
      };

      const response = await api.post('/exam/questions', questionData);
      const newQuestion = { ...response.data, id: response.data._id };

      const newSections = [...exam.sections];
      newSections[selectedSection].questions.push(newQuestion);
      setExam({ ...exam, sections: newSections });

      setCurrentQuestion({
        questionText: '',
        questionType: 'mcq',
        options: ['', '', '', ''],
        correctAnswers: [''],
        difficulty: 'easy',
        tags: [],
        points: 1,
        media: null,
      });
      setShowQuestionForm(false);
      toast.success('Question created and added to section');
    } catch (error) {
      toast.error('Failed to create question');
    }
  };

  const addQuestionFromBank = (question) => {
    const newSections = [...exam.sections];
    const questionExists = newSections[selectedSection].questions.some(q => q._id === question._id);

    if (questionExists) {
      toast.error('Question already exists in this section');
      return;
    }

    newSections[selectedSection].questions.push({ ...question, id: question._id });
    setExam({ ...exam, sections: newSections });
    toast.success('Question added to section');
  };

  const removeQuestionFromSection = (sectionIndex, questionId) => {
    const newSections = [...exam.sections];
    newSections[sectionIndex].questions = newSections[sectionIndex].questions.filter(q => q.id !== questionId);
    setExam({ ...exam, sections: newSections });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!exam.title.trim() || !exam.classId) {
      toast.error('Exam title and class selection are required');
      return;
    }

    const totalQuestions = exam.sections.reduce((total, section) => total + section.questions.length, 0);
    if (totalQuestions === 0) {
      toast.error('At least one question is required');
      return;
    }

    setLoading(true);
    try {
      const examData = {
        title: exam.title,
        duration: exam.duration,
        passPercentage: exam.passPercentage,
        instructions: exam.instructions,
        classId: exam.classId,
        accessCode: exam.accessCode,
        sections: exam.sections.map(section => ({
          name: section.name,
          instructions: section.instructions,
          questions: section.questions.map(q => q._id || q.id),
          randomizeQuestions: section.randomizeQuestions,
        })),
      };

      if (isEditing) {
        await api.put(`/exam/teacher/exam/${examId}`, examData);
        toast.success('Exam updated successfully!');
        navigate('/teacher/manage-exams');
        return;
      } else {
        await api.post('/exam/teacher/create-exam', examData);
        toast.success('Exam created successfully!');

        // Reset form for new exam creation
        setExam({
          title: '',
          duration: 60,
          passPercentage: 50,
          instructions: '',
          classId: '',
          accessCode: '',
          sections: [{
            name: 'Section 1',
            instructions: '',
            questions: [],
            randomizeQuestions: false,
          }],
        });
        setSelectedSection(0);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} exam`);
    } finally {
      setLoading(false);
    }
  };

  const getTotalQuestions = () => {
    return exam.sections.reduce((total, section) => total + section.questions.length, 0);
  };

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">{isEditing ? 'Update Exam' : 'Create Exam'}</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-8">
        <h2 className="text-2xl font-semibold mb-4">Exam Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">Title</label>
            <input
              type="text"
              name="title"
              value={exam.title}
              onChange={handleExamChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Class</label>
            <select
              name="classId"
              value={exam.classId}
              onChange={handleExamChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select a class</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>{cls.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              value={exam.duration}
              onChange={handleExamChange}
              className="w-full p-2 border rounded"
              min="1"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Pass Percentage</label>
            <input
              type="number"
              name="passPercentage"
              value={exam.passPercentage}
              onChange={handleExamChange}
              className="w-full p-2 border rounded"
              min="0"
              max="100"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">Instructions</label>
            <textarea
              name="instructions"
              value={exam.instructions}
              onChange={handleExamChange}
              className="w-full p-2 border rounded"
              rows="4"
              placeholder="Enter exam instructions (optional)"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Access Code (optional)</label>
            <input
              type="text"
              name="accessCode"
              value={exam.accessCode}
              onChange={handleExamChange}
              className="w-full p-2 border rounded"
              placeholder="Enter access code for exam security"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
            disabled={!exam.title.trim() || !exam.classId || getTotalQuestions() === 0}
          >
            Preview Exam
          </button>
          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
            disabled={loading}
          >
            {loading ? 'Saving...' : (isEditing ? 'Update Exam' : 'Create Exam')}
          </button>
        </div>
      </form>

      {/* Sections */}
      <div className="bg-white p-6 rounded shadow mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Sections ({exam.sections.length})</h2>
          <button
            onClick={addSection}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add Section
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex flex-wrap gap-2 mb-4">
          {exam.sections.map((section, index) => (
            <button
              key={index}
              onClick={() => setSelectedSection(index)}
              className={`px-4 py-2 rounded ${
                selectedSection === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {section.name} ({section.questions.length})
            </button>
          ))}
        </div>

        {/* Current Section */}
        <div className="border p-4 rounded mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 mb-2">Section Name</label>
              <input
                type="text"
                value={exam.sections[selectedSection].name}
                onChange={(e) => handleSectionChange(selectedSection, 'name', e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={exam.sections[selectedSection].randomizeQuestions}
                  onChange={(e) => handleSectionChange(selectedSection, 'randomizeQuestions', e.target.checked)}
                  className="mr-2"
                />
                Randomize Questions
              </label>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Section Instructions</label>
            <textarea
              value={exam.sections[selectedSection].instructions}
              onChange={(e) => handleSectionChange(selectedSection, 'instructions', e.target.value)}
              className="w-full p-2 border rounded"
              rows="3"
              placeholder="Enter section-specific instructions (optional)"
            />
          </div>

          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              Questions in {exam.sections[selectedSection].name} ({exam.sections[selectedSection].questions.length})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setShowQuestionBank(true)}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
              >
                Add from Question Bank
              </button>
              <button
                onClick={() => setShowQuestionForm(!showQuestionForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {showQuestionForm ? 'Cancel' : 'Create Question'}
              </button>
              {exam.sections.length > 1 && (
                <button
                  onClick={() => removeSection(selectedSection)}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Remove Section
                </button>
              )}
            </div>
          </div>

          {/* Manual Question Creation Form */}
          {showQuestionForm && (
            <div className="border p-4 rounded mb-4 bg-gray-50">
              <h4 className="text-lg font-semibold mb-4">Create New Question</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">Question Type *</label>
                  <select
                    name="questionType"
                    value={currentQuestion.questionType}
                    onChange={handleQuestionChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="mcq">Multiple Choice (Single)</option>
                    <option value="multiple">Multiple Choice (Multiple)</option>
                    <option value="text">Text Answer</option>
                    <option value="code">Code Answer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Difficulty *</label>
                  <select
                    name="difficulty"
                    value={currentQuestion.difficulty}
                    onChange={handleQuestionChange}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Question Text *</label>
                <textarea
                  name="questionText"
                  value={currentQuestion.questionText}
                  onChange={handleQuestionChange}
                  className="w-full p-2 border rounded"
                  rows="3"
                  required
                />
              </div>

              {(currentQuestion.questionType === 'mcq' || currentQuestion.questionType === 'multiple') && (
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Options *</label>
                  {currentQuestion.options.map((option, index) => (
                    <input
                      key={index}
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="w-full p-2 border rounded mb-2"
                      placeholder={`Option ${String.fromCharCode(65 + index)}`}
                      required
                    />
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 mb-2">
                    Correct Answer{currentQuestion.questionType === 'multiple' ? 's (comma separated)' : ''} *
                  </label>
                  <input
                    type="text"
                    value={currentQuestion.correctAnswers.join(', ')}
                    onChange={(e) => setCurrentQuestion({
                      ...currentQuestion,
                      correctAnswers: e.target.value.split(',').map(ans => ans.trim()).filter(ans => ans !== '')
                    })}
                    className="w-full p-2 border rounded"
                    placeholder={currentQuestion.questionType === 'multiple' ? 'A, C' : 'Correct answer'}
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Points *</label>
                  <input
                    type="number"
                    name="points"
                    value={currentQuestion.points}
                    onChange={(e) => setCurrentQuestion({ ...currentQuestion, points: parseInt(e.target.value) || 1 })}
                    className="w-full p-2 border rounded"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Tags (comma separated)</label>
                <input
                  type="text"
                  value={currentQuestion.tags.join(', ')}
                  onChange={(e) => handleTagChange(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="math, algebra, geometry"
                />
              </div>

              <button
                onClick={addManualQuestion}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Create and Add Question
              </button>
            </div>
          )}

          {/* Questions in Section */}
          <div className="space-y-4">
            {exam.sections[selectedSection].questions.map((question, index) => (
              <div key={question.id} className="border p-4 rounded bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold">Question {index + 1}: {question.questionText || question.question}</h4>
                  <button
                    onClick={() => removeQuestionFromSection(selectedSection, question.id)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                </div>
                <QuestionRenderer
                  question={{
                    question: question.questionText || question.question,
                    type: question.questionType || question.type,
                    options: question.options,
                    media: question.media,
                  }}
                  onAnswerChange={() => {}}
                  answer={null}
                />
                <div className="flex gap-2 mt-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    (question.difficulty || question.difficulty) === 'easy' ? 'bg-green-100 text-green-800' :
                    (question.difficulty || question.difficulty) === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {(question.difficulty || question.difficulty)?.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                    {(question.questionType || question.type)?.toUpperCase()}
                  </span>
                  <span className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                    {question.points || 1} point{(question.points || 1) !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Question Bank Modal */}
      {showQuestionBank && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Question Bank</h2>
              <button
                onClick={() => setShowQuestionBank(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Search questions..."
                value={questionBankFilters.search}
                onChange={(e) => setQuestionBankFilters({ ...questionBankFilters, search: e.target.value })}
                className="border rounded px-3 py-2"
              />
              <select
                value={questionBankFilters.difficulty}
                onChange={(e) => setQuestionBankFilters({ ...questionBankFilters, difficulty: e.target.value })}
                className="border rounded px-3 py-2"
              >
                <option value="">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <input
                type="text"
                placeholder="Filter by tags"
                value={questionBankFilters.tags}
                onChange={(e) => setQuestionBankFilters({ ...questionBankFilters, tags: e.target.value })}
                className="border rounded px-3 py-2"
              />
            </div>

            {/* Questions */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {questionBank.map((question) => {
                const isAdded = exam.sections[selectedSection].questions.some(q => q._id === question._id);
                return (
                  <div key={question._id} className="border p-4 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-semibold mb-1">{question.questionText}</p>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                            question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {question.difficulty}
                          </span>
                          <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                            {question.questionType}
                          </span>
                          {question.tags.map((tag, index) => (
                            <span key={index} className="px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => addQuestionFromBank(question)}
                        disabled={isAdded}
                        className={`px-3 py-1 rounded text-sm ${
                          isAdded
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {isAdded ? 'Added' : 'Add to Section'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && (
        <ExamPreviewModal
          exam={{
            title: exam.title,
            duration: exam.duration,
            passPercentage: exam.passPercentage,
            instructions: exam.instructions,
            class: classes.find(cls => cls._id === exam.classId),
            isPublished: false,
            sections: exam.sections,
          }}
          onClose={() => setShowPreviewModal(false)}
        />
      )}
    </div>
  );
};

export default CreateExam;
