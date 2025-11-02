import React, { useState, useEffect } from 'react';
import { Link, Routes, Route, useParams } from 'react-router-dom';
import { useClass } from '../../context/ClassContext';
import toast from 'react-hot-toast';

const EditClassModal = ({ isOpen, onClose, classData, onSave }) => {
  const [title, setTitle] = useState(classData?.title || '');
  const [description, setDescription] = useState(classData?.description || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (classData) {
      setTitle(classData.title || '');
      setDescription(classData.description || '');
    }
  }, [classData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Class title is required');
      return;
    }
    setLoading(true);
    try {
      await onSave(classData._id, title.trim(), description.trim());
      onClose();
    } catch (error) {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Edit Class</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Class Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded"
              rows="3"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ManageClasses = () => {
  const { classes, deletedClasses, createClass, deleteClass, recoverClass, updateClass, loading } = useClass();
  const [newClass, setNewClass] = useState({ title: '', description: '' });
  const [createdClassCode, setCreatedClassCode] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClass.title.trim()) {
      toast.error('Class title is required');
      return;
    }

    const createdClass = await createClass(newClass.title.trim(), newClass.description.trim());
    if (createdClass?.classCode) {
      setCreatedClassCode(createdClass.classCode);
      setNewClass({ title: '', description: '' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Classes</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-2xl font-semibold mb-4">Create New Class</h2>
        <form onSubmit={handleCreateClass}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Class Title</label>
            <input
              type="text"
              value={newClass.title}
              onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Description</label>
            <textarea
              value={newClass.description}
              onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
              className="w-full p-2 border rounded"
              rows="3"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {loading ? 'Creating...' : 'Create Class'}
          </button>
        </form>
        {createdClassCode && (
          <p className="mt-4 text-green-600 font-semibold">
            Class created successfully! Class Code: <span className="font-mono">{createdClassCode}</span>
          </p>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">My Classes</h2>
        {classes.length === 0 ? (
          <p>No classes created yet.</p>
        ) : (
          <ul className="space-y-4">
            {classes.map((cls) => (
              <li key={cls._id} className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold">{cls.title}</h3>
                  {cls.description && <p className="text-gray-600 mb-2">{cls.description}</p>}
                  <p>Class Code: <span className="font-mono">{cls.classCode}</span></p>
                  <p>Pending: {cls.students.filter(s => s.status === 'pending').length}</p>
                  <p>Approved: {cls.students.filter(s => s.status === 'approved').length}</p>
                  <p>Rejected: {cls.students.filter(s => s.status === 'rejected').length}</p>
                </div>
                <div className="flex space-x-2">
                  <Link
                    to={`/teacher/manage-classes/${cls._id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    View Class
                  </Link>
                  <button
                    onClick={() => {
                      setEditingClass(cls);
                      setEditModalOpen(true);
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteClass(cls._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  >
                    Delete Class
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {deletedClasses.length > 0 && (
        <div className="bg-gray-100 p-6 rounded-lg shadow mt-8">
          <h2 className="text-2xl font-semibold mb-4">Deleted Classes (Recoverable for 2 days)</h2>
          <ul className="space-y-4">
            {deletedClasses.map((cls) => (
              <li key={cls._id} className="bg-white p-6 rounded-lg shadow flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold">{cls.title}</h3>
                  <p>Class Code: <span className="font-mono">{cls.classCode}</span></p>
                  <p>Deleted At: {new Date(cls.deletedAt).toLocaleString()}</p>
                </div>
                <button
                  onClick={() => recoverClass(cls._id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Recover Class
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <EditClassModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingClass(null);
        }}
        classData={editingClass}
        onSave={updateClass}
      />
    </div>
  );
};
export default ManageClasses;
