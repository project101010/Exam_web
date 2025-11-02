import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await api.get('/exam/student/results');
        setResults(response.data);
      } catch (error) {
        console.error('Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) {
    return <div className="text-center">Loading results...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Results</h1>
      {results.length === 0 ? (
        <p>No results available.</p>
      ) : (
        <div className="space-y-6">
          {results.map((result) => (
            <div key={result._id} className="bg-white p-6 rounded shadow">
              <h2 className="text-2xl font-semibold mb-2">{result.examTitle}</h2>
              <p className="text-gray-600 mb-4">Date: {new Date(result.submittedAt).toLocaleDateString()}</p>
              <div className="mb-4">
                <span className="text-lg font-semibold">Overall Score: {result.totalScore} / {result.maxScore}</span>
                <div className="w-full bg-gray-200 rounded-full h-4 mt-2">
                  <div
                    className="bg-green-600 h-4 rounded-full"
                    style={{ width: `${(result.totalScore / result.maxScore) * 100}%` }}
                  ></div>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Section-wise Scores</h3>
              <ul className="space-y-2">
                {result.sectionScores?.map((section, index) => (
                  <li key={index} className="border p-3 rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{section.sectionName}:</span>
                      <span>{section.score} / {section.maxScore} ({section.percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${section.percentage}%` }}
                      ></div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Results;
