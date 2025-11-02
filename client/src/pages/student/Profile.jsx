import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, changePassword, deleteAccount } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setLoading(true);
    const result = await changePassword(currentPassword, newPassword);
    setLoading(false);
    if (result.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      await deleteAccount();
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Student Profile</h1>

      <div className="mb-6">
        <button
          onClick={() => setActiveTab('profile')}
          className={`mr-4 px-4 py-2 rounded ${activeTab === 'profile' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Profile Info
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded ${activeTab === 'settings' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Settings
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded shadow max-w-md">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Name</label>
            <p className="text-gray-900">{user.name}</p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <p className="text-gray-900">{user.email}</p>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
            <p className="text-gray-900 capitalize">{user.role}</p>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div>
          <div className="bg-white p-6 rounded shadow max-w-md mb-8">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <form onSubmit={handleChangePassword}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>

          <div className="bg-white p-6 rounded shadow max-w-md">
            <h2 className="text-xl font-semibold mb-4">Danger Zone</h2>
            <p className="text-sm text-gray-600 mb-4">
              Deleting your account will schedule it for removal. You can recover your account within 10 days by visiting the Recover Account page (accessible from the sign-in page or Help Center).
            </p>
            <button
              onClick={handleDeleteAccount}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
