import React, { useState, useEffect } from 'react';
import { useClass } from '../../context/ClassContext';
import api from '../../utils/api';

const Dashboard = () => {
  const { classes } = useClass();
  const [upcomingExams, setUpcomingExams] = useState([]);
  const [recentResults, setRecentResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examsRes, resultsRes] = await Promise.all([
          api.get('/exam/student/exams'),
          api.get('/exam/student/results')
        ]);

        // Filter upcoming exams
        const upcoming = examsRes.data.filter(exam => exam.status === 'upcoming');
        setUpcomingExams(upcoming);

        // Get recent results (limit to 5)
        setRecentResults(resultsRes.data.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Enrolled Classes</h2>
          <p className="text-4xl font-bold">{classes.length}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Upcoming Exams</h2>
          <p className="text-4xl font-bold">{upcomingExams.length}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Recent Results</h2>
          <p className="text-4xl font-bold">{recentResults.length}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Upcoming Exams</h2>
        <ul>
          {upcomingExams.map((exam) => (
            <li key={exam.id} className="border-b py-2">
              <span className="font-semibold">{exam.title}</span> - {exam.date}
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-6 rounded shadow mt-8">
        <h2 className="text-2xl font-semibold mb-4">Recent Results</h2>
        <ul>
          {recentResults.map((result) => (
            <li key={result.id} className="border-b py-2">
              <span className="font-semibold">{result.exam}</span> - {result.score} / {result.maxScore}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
