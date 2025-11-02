import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await api.get('/exam/student/exams');
        setExams(response.data);
      } catch (error) {
        console.error('Error fetching exams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const upcomingExams = exams.filter(exam => exam.status === 'upcoming');
  const ongoingExams = exams.filter(exam => exam.status === 'ongoing');
  const completedExams = exams.filter(exam => exam.status === 'completed');

  if (loading) {
    return <div>Loading exams...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Exams</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Ongoing Exams</h2>
        {ongoingExams.length === 0 ? (
          <p>No ongoing exams.</p>
        ) : (
          <ul className="space-y-2">
            {ongoingExams.map((exam) => (
              <li key={exam.id} className="p-4 bg-white rounded shadow flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-lg">{exam.title}</h3>
                  <p>Due: {exam.date}</p>
                </div>
                <Link
                  to={`/student/take-exam/${exam.id}`}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  Start Exam
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Upcoming Exams</h2>
        {upcomingExams.length === 0 ? (
          <p>No upcoming exams.</p>
        ) : (
          <ul className="space-y-2">
            {upcomingExams.map((exam) => (
              <li key={exam.id} className="p-4 bg-white rounded shadow">
                <h3 className="font-semibold text-lg">{exam.title}</h3>
                <p>Scheduled: {exam.date}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Completed Exams</h2>
        {completedExams.length === 0 ? (
          <p>No completed exams.</p>
        ) : (
          <ul className="space-y-2">
            {completedExams.map((exam) => (
              <li key={exam.id} className="p-4 bg-white rounded shadow">
                <h3 className="font-semibold text-lg">{exam.title}</h3>
                <p>Completed: {exam.date}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Exams;
