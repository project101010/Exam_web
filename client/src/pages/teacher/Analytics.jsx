import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import LoadingSkeleton from '../../components/LoadingSkeleton';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/exam/teacher/analytics');
        setAnalytics(response.data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-4 md:p-6">
        <LoadingSkeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <LoadingSkeleton className="h-64" />
          <LoadingSkeleton className="h-64" />
        </div>
        <LoadingSkeleton className="h-32 mt-8" />
      </div>
    );
  }

  if (!analytics) {
    return <div className="text-center">No analytics data available.</div>;
  }

  const passFailData = [
    { name: 'Passed', value: Math.round((analytics.passRate / 100) * analytics.totalSubmissions) },
    { name: 'Failed', value: analytics.totalSubmissions - Math.round((analytics.passRate / 100) * analytics.totalSubmissions) }
  ];
  const COLORS = ['#10B981', '#EF4444'];

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-2xl font-bold text-blue-600">{analytics.averageScore}%</p>
          <p className="text-gray-600">Average Score</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-2xl font-bold text-green-600">{analytics.passRate}%</p>
          <p className="text-gray-600">Pass Rate</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-2xl font-bold text-purple-600">{analytics.totalExams}</p>
          <p className="text-gray-600">Total Exams</p>
        </div>
        <div className="bg-white p-4 rounded shadow text-center">
          <p className="text-2xl font-bold text-orange-600">{analytics.totalSubmissions}</p>
          <p className="text-gray-600">Total Submissions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Exam Performance</h2>
          {analytics.examAnalytics.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.examAnalytics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="examTitle" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="averageScore" fill="#3B82F6" name="Average Score (%)" />
                <Bar dataKey="passRate" fill="#10B981" name="Pass Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p>No exam data available.</p>
          )}
        </div>

        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Pass/Fail Distribution</h2>
          {analytics.totalSubmissions > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={passFailData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {passFailData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p>No submission data available.</p>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Class-wise Analytics</h2>
        {analytics.classAnalytics.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Class</th>
                  <th className="px-4 py-2 text-left">Exams</th>
                  <th className="px-4 py-2 text-left">Submissions</th>
                  <th className="px-4 py-2 text-left">Avg Score</th>
                  <th className="px-4 py-2 text-left">Pass Rate</th>
                </tr>
              </thead>
              <tbody>
                {analytics.classAnalytics.map((cls, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">{cls.classTitle}</td>
                    <td className="px-4 py-2">{cls.totalExams}</td>
                    <td className="px-4 py-2">{cls.totalSubmissions}</td>
                    <td className="px-4 py-2">{cls.averageScore}%</td>
                    <td className="px-4 py-2">{cls.passRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No class data available.</p>
        )}
      </div>
    </div>
  );
};

export default Analytics;
