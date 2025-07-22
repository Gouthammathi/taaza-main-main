import React, { useState } from 'react';
import { MdNotifications, MdAccountCircle, MdLogout } from 'react-icons/md';

const AdminHeader = ({ admin, onLogout }) => {
  const [showModal, setShowModal] = useState(false);

  // Close modal on background click
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('admin-logout-overlay')) {
      setShowModal(false);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
        </div>
        <div className="flex items-center space-x-4">
          {/* Admin Profile Section */}
          <div
            className="flex items-center space-x-2 cursor-pointer select-none"
            onClick={() => setShowModal(true)}
            tabIndex={0}
          >
            <div className="text-right pr-2">
              <p className="text-sm font-medium text-gray-800">{admin?.email || 'Admin'}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <MdAccountCircle className="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>
      {/* Modal for Logout */}
      {showModal && (
        <div
          className="admin-logout-overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm"
          onClick={handleOverlayClick}
        >
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-xs flex flex-col items-center">
            <MdAccountCircle className="w-12 h-12 text-gray-600 mb-2" />
            <div className="mb-4 text-center">
              <p className="text-base font-semibold text-gray-800">{admin?.email || 'Admin'}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <button
              onClick={() => { setShowModal(false); onLogout(); }}
              className="w-full mb-2 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              <MdLogout className="inline-block mr-2 align-middle" /> Logout
            </button>
            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminHeader; 