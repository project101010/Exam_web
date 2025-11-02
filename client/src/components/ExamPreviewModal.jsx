import React from 'react';
import QuestionRenderer from './QuestionRenderer';

const ExamPreviewModal = ({ exam, onClose }) => {
  if (!exam) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Exam Preview: {exam.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="mb-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>Duration:</strong> {exam.duration} minutes</div>
              <div><strong>Pass Percentage:</strong> {exam.passPercentage}%</div>
              <div><strong>Class:</strong> {exam.class?.title}</div>
              <div><strong>Status:</strong> {exam.isPublished ? 'Published' : 'Draft'}</div>
            </div>
            {exam.instructions && (
              <div className="mt-4">
                <strong>Instructions:</strong>
                <p className="mt-2 text-gray-700">{exam.instructions}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Questions ({exam.questions?.length || 0})</h3>
            {exam.questions?.map((question, index) => (
              <div key={question._id || index} className="border rounded p-4">
                <h4 className="font-semibold mb-2">Question {index + 1}: {question.question}</h4>
                <QuestionRenderer
                  question={question}
                  onAnswerChange={() => {}}
                  answer={null}
                  preview={true}
                />
                {question.correctAnswer && (
                  <div className="mt-4 p-3 bg-green-50 border-l-4 border-green-400">
                    <strong>Correct Answer:</strong>
                    <div className="mt-1">
                      {Array.isArray(question.correctAnswer)
                        ? question.correctAnswer.join(', ')
                        : question.correctAnswer
                      }
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPreviewModal;
