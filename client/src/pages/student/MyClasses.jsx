import React, { useState } from 'react';
import { useClass } from '../../context/ClassContext';

const MyClasses = () => {
  const { classes, joinClass, loading } = useClass();
  const [classCode, setClassCode] = useState('');

  const handleJoin = (e) => {
    e.preventDefault();
    if (classCode.trim()) {
      joinClass(classCode.trim());
      setClassCode('');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Classes</h1>
      <form onSubmit={handleJoin} className="mb-6 flex space-x-2">
        <input
          type="text"
          placeholder="Enter class code"
          value={classCode}
          onChange={(e) => setClassCode(e.target.value)}
          className="flex-1 p-2 border rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 rounded hover:bg-blue-700 transition"
        >
          {loading ? 'Joining...' : 'Join Class'}
        </button>
      </form>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Approved Classes</h2>
        {classes.length === 0 ? (
          <p>No classes joined yet.</p>
        ) : (
          <ul className="space-y-2">
            {classes.map((cls) => (
              <li key={cls.id} className="p-4 bg-white rounded shadow">
                <h3 className="font-semibold text-lg">{cls.title}</h3>
                <p>{cls.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MyClasses;
