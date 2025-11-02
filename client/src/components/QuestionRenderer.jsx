import React, { useState } from 'react';

const QuestionRenderer = ({ question, onAnswerChange, answer, preview = false }) => {
  const [selectedOptions, setSelectedOptions] = useState(answer?.selectedOptions || []);
  const [textAnswer, setTextAnswer] = useState(answer?.text || '');
  const [codeAnswer, setCodeAnswer] = useState(answer?.code || '');

  const handleOptionChange = (option) => {
    let newSelected;
    if (question.type === 'mcq') {
      newSelected = [option];
    } else if (question.type === 'multiple') {
      newSelected = selectedOptions.includes(option)
        ? selectedOptions.filter((opt) => opt !== option)
        : [...selectedOptions, option];
    }
    setSelectedOptions(newSelected);
    onAnswerChange({ selectedOptions: newSelected });
  };

  const handleTextChange = (value) => {
    setTextAnswer(value);
    onAnswerChange({ text: value });
  };

  const handleCodeChange = (value) => {
    setCodeAnswer(value);
    onAnswerChange({ code: value });
  };

  const renderOptions = () => {
    return question.options.map((option, index) => (
      <label key={index} className="flex items-center space-x-2">
        <input
          type={question.type === 'mcq' ? 'radio' : 'checkbox'}
          name={`question-${question.id}`}
          value={option}
          checked={
            question.type === 'mcq'
              ? selectedOptions[0] === option
              : selectedOptions.includes(option)
          }
          onChange={() => handleOptionChange(option)}
          className="form-radio text-blue-600"
          disabled={preview}
        />
        <span>{option}</span>
      </label>
    ));
  };

  const renderMultimedia = () => {
    if (!question.media) return null;
    if (question.media.type === 'image') {
      return <img src={question.media.url} alt="Question media" className="max-w-full h-auto mb-4" />;
    } else if (question.media.type === 'video') {
      return <video controls className="max-w-full h-auto mb-4"><source src={question.media.url} /></video>;
    } else if (question.media.type === 'audio') {
      return <audio controls className="mb-4"><source src={question.media.url} /></audio>;
    }
    return null;
  };

  return (
    <div className="mb-6 p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">{question.question}</h3>
      {renderMultimedia()}
      {question.type === 'mcq' || question.type === 'multiple' ? (
        <div className="space-y-2">{renderOptions()}</div>
      ) : question.type === 'text' ? (
        <textarea
          value={textAnswer}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full p-2 border rounded"
          rows="4"
          placeholder="Enter your answer here..."
          disabled={preview}
        />
      ) : question.type === 'code' ? (
        <textarea
          value={codeAnswer}
          onChange={(e) => handleCodeChange(e.target.value)}
          className="w-full p-2 border rounded font-mono"
          rows="10"
          placeholder="Write your code here..."
          disabled={preview}
        />
      ) : null}
    </div>
  );
};

export default QuestionRenderer;
