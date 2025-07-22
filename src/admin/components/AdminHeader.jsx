import React, { useState } from 'react';
import { MdNotifications, MdAccountCircle, MdLogout } from 'react-icons/md';

const AdminHeader = ({ admin, onLogout }) => {
  const [showLogout, setShowLogout] = useState(false);
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-gray-800">Admin Dashboard</h2>
        </div>
        <div className="flex items-center space-x-4">
          {/* Admin Profile */}
          <div className="flex items-center space-x-3 relative">
            <div
              className="flex items-center space-x-2 cursor-pointer select-none"
              onClick={() => setShowLogout((prev) => !prev)}
              tabIndex={0}
              onBlur={() => setTimeout(() => setShowLogout(false), 150)}
            >
              <MdAccountCircle className="w-8 h-8 text-gray-600" />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-800">
                  {admin?.email || 'Admin'}
                </p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
            {showLogout && (
              <button
                onMouseDown={onLogout}
                className="absolute right-0 mt-12 bg-white border border-gray-200 shadow-lg flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 z-10"
                style={{ minWidth: 120 }}
              >
                <MdLogout className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader; 