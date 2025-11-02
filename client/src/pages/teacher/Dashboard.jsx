import React, { useState, useEffect } from 'react';
import { useClass } from '../../context/ClassContext';
import api from '../../utils/api';

const Dashboard = () => {
  const { classes } = useClass();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const response = await api.get('/exam/teacher/exams');
        setExams(response.data);
      } catch (error) {
        console.error('Error fetching exams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  const totalExams = exams.length;
  const pendingGrading = exams.reduce((count, exam) => {
    // Assuming we need to check results for each exam
    // For now, we'll use a placeholder - in a real app, you'd fetch results per exam
    return count + (exam.needsGrading ? 1 : 0);
  }, 0);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Teacher Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Created Classes</h2>
          <p className="text-4xl font-bold">{classes.length}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Pending Grading</h2>
          <p className="text-4xl font-bold">{pendingGrading}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-2">Total Exams</h2>
          <p className="text-4xl font-bold">{totalExams}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-semibold mb-4">Recent Exams</h2>
        {exams.length === 0 ? (
          <p>No exams created yet.</p>
        ) : (
          <ul className="space-y-2">
            {exams.slice(0, 5).map((exam) => (
              <li key={exam._id} className="border-b py-2">
                <span className="font-semibold">{exam.title}</span> - Created on {new Date(exam.createdAt).toLocaleDateString()}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
