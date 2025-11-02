import React, { useState, useEffect } from 'react';
import QuestionRenderer from '../../components/QuestionRenderer';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const GradeExams = () => {
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [exam, setExam] = useState(null);
  const [totalScore, setTotalScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUngradedSubmissions();
  }, []);

  const fetchUngradedSubmissions = async () => {
    try {
      const response = await api.get('/exam/teacher/submissions');
      setSubmissions(response.data);
    } catch (error) {
      toast.error('Failed to fetch submissions');
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (examId) => {
    try {
      const response = await api.get(`/exam/teacher/exam/${examId}`);
      setQuestions(response.data.questions || []);
    } catch (error) {
      toast.error('Failed to fetch questions');
    }
  };

  const handleGrade = async (submissionId) => {
    try {
      await api.post(`/exam/teacher/grade/${submissionId}`, { score: parseInt(totalScore), feedback });
      toast.success('Submission graded successfully!');
      setSelectedSubmission(null);
      setTotalScore('');
      setFeedback('');
      fetchUngradedSubmissions(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit grades');
    }
  };

  const handleSelectSubmission = async (submission) => {
    setSelectedSubmission(submission);
    await fetchQuestions(submission.examId);
    await fetchExam(submission.examId); // Fetch exam to get sections
  };

  const fetchExam = async (examId) => {
    try {
      const response = await api.get(`/exam/teacher/exam/${examId}`);
      setExam(response.data);
    } catch (error) {
      toast.error('Failed to fetch exam details');
    }
  };

  const allSubmissions = submissions;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Grade Exams</h1>

      {allSubmissions.length === 0 ? (
        <p>No submissions to grade.</p>
      ) : (
        <div className="space-y-4">
          {allSubmissions.map((submission) => (
            <div key={submission.id} className="bg-white p-6 rounded shadow">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{submission.student} - {submission.exam}</h3>
                  <p className="text-gray-600">Submitted: {submission.submittedAt}</p>
                </div>
                <button
                  onClick={() => handleSelectSubmission(submission)}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Grade
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded shadow max-w-4xl w-full max-h-full overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              Grading: {selectedSubmission.student} - {selectedSubmission.exam}
            </h2>
            <div className="space-y-6">
              {exam?.sections?.map((section, sectionIndex) => (
                <div key={sectionIndex} className="border p-4 rounded">
                  <h3 className="text-lg font-semibold mb-4">Section {sectionIndex + 1}: {section.name}</h3>
                  {section.questions.map((question, questionIndex) => {
                    const answer = selectedSubmission.answers.find(a => a.questionId === question.id);
                    return (
                      <div key={question.id} className="mb-4 border-l-4 border-blue-400 pl-4">
                        <h4 className="font-medium mb-2">Question {questionIndex + 1}: {question.question}</h4>
                        <QuestionRenderer
                          question={question}
                          onAnswerChange={() => {}}
                          answer={answer?.answer}
                        />
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="mt-6">
              <label className="block text-gray-700 mb-2">Total Score</label>
              <input
                type="number"
                min="0"
                max={questions.length}
                value={totalScore}
                onChange={(e) => setTotalScore(e.target.value)}
                className="w-full p-2 border rounded"
                required
              />
              <label className="block text-gray-700 mb-2 mt-4">Feedback</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-2 border rounded"
                rows="4"
                placeholder="Optional feedback for the student"
              />
            </div>
            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={() => setSelectedSubmission(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleGrade(selectedSubmission.id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Submit Grades
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeExams;
