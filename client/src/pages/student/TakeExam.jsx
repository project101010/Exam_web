import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuestionRenderer from '../../components/QuestionRenderer';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const TakeExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessCode, setAccessCode] = useState('');
  const [showAccessCodePrompt, setShowAccessCodePrompt] = useState(false);

  // Anti-cheating state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [fullscreenExits, setFullscreenExits] = useState(0);
  const [suspiciousActivities, setSuspiciousActivities] = useState([]);
  const [warningMessage, setWarningMessage] = useState('');
  const examStartTime = useRef(null);
  const lastActivityTime = useRef(null);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const url = accessCode ? `/exam/student/exam/${id}?accessCode=${encodeURIComponent(accessCode)}` : `/exam/student/exam/${id}`;
        const response = await api.get(url);
        setExam(response.data);
        setTimeLeft(response.data.duration * 60);
        setShowAccessCodePrompt(false);

        // Initialize anti-cheating measures
        examStartTime.current = new Date();
        lastActivityTime.current = new Date();

        // Enter fullscreen if required
        if (response.data.antiCheating?.requireFullscreen) {
          enterFullscreen();
        }

        // Set up anti-cheating event listeners
        setupAntiCheatingListeners();
      } catch (error) {
        if (error.response?.status === 403 && error.response?.data?.message === 'Invalid access code') {
          setShowAccessCodePrompt(true);
          toast.error('Invalid access code. Please try again.');
        } else {
          toast.error('Failed to load exam');
          navigate('/student/exams');
        }
      } finally {
        setLoading(false);
      }
    };

    if (!showAccessCodePrompt) {
      fetchExam();
    }

    // Cleanup function
    return () => {
      cleanupAntiCheatingListeners();
      exitFullscreen();
    };
  }, [id, navigate, accessCode, showAccessCodePrompt]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  useEffect(() => {
    const autoSave = setInterval(() => {
      // Auto-save logic (placeholder)
      console.log('Auto-saving answers:', answers);
    }, 30000); // 30 seconds
    return () => clearInterval(autoSave);
  }, [answers]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSectionChange = (sectionIndex) => {
    setCurrentSection(sectionIndex);
    setCurrentQuestion(0); // Reset to first question in section
  };

  const handleNext = () => {
    const currentSectionData = exam.sections[currentSection];
    if (currentQuestion < currentSectionData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentSection < exam.sections.length - 1) {
      setCurrentSection(currentSection + 1);
      setCurrentQuestion(0);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
      const prevSectionData = exam.sections[currentSection - 1];
      setCurrentQuestion(prevSectionData.questions.length - 1);
    }
  };

  const handleSubmit = async () => {
    if (submitted || !exam) return;
    setSubmitted(true);

    try {
      const cheatingFlags = {
        tabSwitches,
        fullscreenExits,
        suspiciousActivities,
      };

      const submissionData = {
        examId: exam._id,
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId: parseInt(questionId),
          answer,
        })),
        cheatingFlags,
      };

      await api.post('/exam/student/submit', submissionData);
      toast.success('Exam submitted successfully!');
      navigate('/student/results');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit exam');
      setSubmitted(false);
    }
  };

  // Anti-cheating functions
  const enterFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  };

  const setupAntiCheatingListeners = () => {
    if (exam?.antiCheating?.monitorTabs) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    if (exam?.antiCheating?.requireFullscreen) {
      document.addEventListener('fullscreenchange', handleFullscreenChange);
      document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.addEventListener('mozfullscreenchange', handleFullscreenChange);
      document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    }

    if (exam?.antiCheating?.preventCopyPaste) {
      document.addEventListener('copy', handleCopyPaste);
      document.addEventListener('paste', handleCopyPaste);
      document.addEventListener('cut', handleCopyPaste);
    }

    if (exam?.antiCheating?.preventRightClick) {
      document.addEventListener('contextmenu', handleRightClick);
    }

    // Track mouse and keyboard activity
    document.addEventListener('mousemove', updateActivityTime);
    document.addEventListener('keydown', updateActivityTime);
    document.addEventListener('click', updateActivityTime);
  };

  const cleanupAntiCheatingListeners = () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    document.removeEventListener('copy', handleCopyPaste);
    document.removeEventListener('paste', handleCopyPaste);
    document.removeEventListener('cut', handleCopyPaste);
    document.removeEventListener('contextmenu', handleRightClick);
    document.removeEventListener('mousemove', updateActivityTime);
    document.removeEventListener('keydown', updateActivityTime);
    document.removeEventListener('click', updateActivityTime);
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      setTabSwitches(prev => prev + 1);
      recordSuspiciousActivity('tab_switch', 'Tab switched or window minimized');
      setWarningMessage('Warning: Tab switching detected! This will be reported.');
      setTimeout(() => setWarningMessage(''), 5000);
    }
  };

  const handleFullscreenChange = () => {
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );

    setIsFullscreen(isCurrentlyFullscreen);

    if (!isCurrentlyFullscreen && exam?.antiCheating?.requireFullscreen) {
      setFullscreenExits(prev => prev + 1);
      recordSuspiciousActivity('fullscreen_exit', 'Exited fullscreen mode');
      setWarningMessage('Warning: Fullscreen exit detected! Please return to fullscreen mode.');
      setTimeout(() => {
        enterFullscreen();
        setWarningMessage('');
      }, 3000);
    }
  };

  const handleCopyPaste = (e) => {
    e.preventDefault();
    recordSuspiciousActivity('copy_paste', `Attempted to ${e.type} content`);
    setWarningMessage('Warning: Copy/paste is not allowed during the exam!');
    setTimeout(() => setWarningMessage(''), 3000);
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    recordSuspiciousActivity('right_click', 'Right-click detected');
    setWarningMessage('Warning: Right-click is disabled during the exam!');
    setTimeout(() => setWarningMessage(''), 3000);
  };

  const updateActivityTime = () => {
    lastActivityTime.current = new Date();
  };

  const recordSuspiciousActivity = (type, description) => {
    const activity = {
      type,
      timestamp: new Date(),
      description,
    };
    setSuspiciousActivities(prev => [...prev, activity]);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="text-center">Loading exam...</div>;
  }

  if (!exam) {
    return <div className="text-center">Exam not found.</div>;
  }

  if (submitted) {
    return <div className="text-center">Submitting exam...</div>;
  }

  if (showAccessCodePrompt) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow max-w-md w-full">
          <h2 className="text-2xl font-bold mb-4">Access Code Required</h2>
          <p className="text-gray-600 mb-4">This exam requires an access code to proceed.</p>
          <input
            type="text"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            placeholder="Enter access code"
          />
          <button
            onClick={() => setShowAccessCodePrompt(false)}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Warning Message */}
        {warningMessage && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Warning:</strong> {warningMessage}
          </div>
        )}

        <div className="bg-white p-4 rounded shadow mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          <div className="text-red-600 font-semibold">
            Time Left: {formatTime(timeLeft)}
          </div>
        </div>

        {exam.instructions && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Exam Instructions</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>{exam.instructions}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section Tabs */}
        <div className="bg-white p-4 rounded shadow mb-4">
          <div className="flex space-x-2 mb-4">
            {exam.sections.map((section, index) => (
              <button
                key={index}
                onClick={() => handleSectionChange(index)}
                className={`px-4 py-2 rounded ${
                  currentSection === index
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {section.name}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow mb-4">
          <div className="mb-4">
            Section {currentSection + 1}: {exam.sections[currentSection].name}
            {exam.sections[currentSection].instructions && (
              <p className="text-sm text-gray-600 mt-1">{exam.sections[currentSection].instructions}</p>
            )}
          </div>

          <div className="mb-4">
            Question {currentQuestion + 1} of {exam.sections[currentSection].questions.length} in this section
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${((currentQuestion + 1) / exam.sections[currentSection].questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <QuestionRenderer
            question={exam.sections[currentSection].questions[currentQuestion]}
            onAnswerChange={(answer) => handleAnswerChange(exam.sections[currentSection].questions[currentQuestion].id, answer)}
            answer={answers[exam.sections[currentSection].questions[currentQuestion].id]}
          />

          <div className="flex justify-between mt-6">
            <button
              onClick={handlePrev}
              disabled={currentSection === 0 && currentQuestion === 0}
              className="bg-gray-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Previous
            </button>
            {currentSection === exam.sections.length - 1 && currentQuestion === exam.sections[currentSection].questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Submit Exam
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeExam;
