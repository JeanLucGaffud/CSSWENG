'use client';

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { Calendar, Search, ArrowUpDown, X, Package, UserPlus, LogOut, Users } from "lucide-react";
import SignOutButton from "@/components/signout_button";
import toast from 'react-hot-toast';

export default function UserManagement() {
  const { data: session, status } = useSession()
  const router = useRouter();
  const pathname = usePathname();

  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [users, setUsers] = useState([])
  const hasFetchedRef = useRef(false)
  const [searchQuery, setSearchQuery] = useState('');

  // EDIT AND DELETE STATES
  const [editingUserId, setEditingUserId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`/api/users`);
        const data = await res.json()
        setUsers(data)
      } catch (err) {
        console.error("Failed to fetch users:", err)
      }
    }
    if (status === "authenticated" && session && document.visibilityState === "visible" && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchUsers()
    }
  }, [status, session])

  const handleRowClick = (user) => {
    if (editingUserId) return; // Don't open modal if editing
    setSelectedUser(user);
    setShowModal(true);
  };

  // EDIT HANDLERS
  const handleEditClick = (e, user) => {
    e.stopPropagation(); // Prevent row click
    setEditingUserId(user._id);
    setEditFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role || 'customer',
      phoneNumber: user.phoneNumber || '',
      accountStatus: user.accountStatus || 'active',
      verificationStatus: user.verificationStatus || 'unverified'
    });
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setEditFormData({});
  };

  const handleSaveEdit = () => {
    setShowEditConfirmModal(true);
  };

  const confirmSaveEdit = async () => {
    try {
      const response = await fetch(`/api/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: editingUserId,
          ...editFormData
        }),
      });
      if (response.ok) {
        setUsers(prev => prev.map(user => 
          user._id === editingUserId 
            ? { ...user, ...editFormData }
            : user
        ));
        setEditingUserId(null);
        setEditFormData({});
        setShowEditConfirmModal(false);
        toast.success('User updated successfully');
      } else {
        toast.error('Failed to update user');
      }
    } catch {
      toast.error('Update request failed');
    }
  };

  // DELETE HANDLERS
  const handleDeleteClick = (e, user) => {
    e.stopPropagation(); // Prevent row click
    setUserToDelete(user);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteUser = async () => {
    try {
      const response = await fetch(`/api/users?userId=${userToDelete._id}`, { 
        method: 'DELETE' 
      });
      if (response.ok) {
        setUsers(prev => prev.filter(user => user._id !== userToDelete._id));
        setShowDeleteConfirmModal(false);
        setUserToDelete(null);
        toast.success('User deleted successfully');
      } else {
        toast.error('Failed to delete user');
      }
    } catch {
      toast.error('Delete request failed');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Remove filter dropdown logic since we're removing filters
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredUsers = users.filter(user => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return user.firstName?.toLowerCase().includes(query) ||
             user.lastName?.toLowerCase().includes(query) ||
             user.email?.toLowerCase().includes(query);
    }
    return true;
  });

  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />;
    return sortConfig.direction === 'asc'
      ? <svg className="h-4 w-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" /></svg>
      : <svg className="h-4 w-4 ml-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" /></svg>;
  };

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aValue = a[sortConfig.key], bValue = b[sortConfig.key];
    if (sortConfig.key === 'dateCreated') { aValue = new Date(aValue); bValue = new Date(bValue); }
    else if (typeof aValue === 'string') { aValue = aValue.toLowerCase(); bValue = bValue.toLowerCase(); }
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }

  function getStatusColor(status, type) {
    if (!status) return "bg-gray-100 text-gray-800 border-gray-200";
    status = status.toLowerCase();
    
    if (type === 'account') {
      if (status === 'active') return "bg-green-100 text-green-800 border-green-200";
      if (status === 'inactive' || status === 'suspended') return "bg-red-100 text-red-800 border-red-200";
      if (status === 'pending') return "bg-yellow-100 text-yellow-800 border-yellow-200";
    } else if (type === 'verification') {
      if (status === 'verified') return "bg-green-100 text-green-800 border-green-200";
      if (status === 'unverified') return "bg-red-100 text-red-800 border-red-200";
      if (status === 'pending') return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
    
    return "bg-gray-100 text-gray-800 border-gray-200";
  }

  function getRoleColor(role) {
    if (!role) return "bg-gray-100 text-gray-800 border-gray-200";
    role = role.toLowerCase();
    if (role === 'admin') return "bg-purple-100 text-purple-800 border-purple-200";
    if (role === 'secretary') return "bg-blue-100 text-blue-800 border-blue-200";
    if (role === 'driver') return "bg-orange-100 text-orange-800 border-orange-200";
    if (role === 'salesman') return "bg-green-100 text-green-800 border-green-200";
    if (role === 'customer') return "bg-gray-100 text-gray-800 border-gray-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  }

  return (
    <div className="flex h-screen bg-[url('/background.jpg')] bg-cover bg-center overflow-hidden">
    {/* Sidebar */}
    <div className="w-50 bg-opacity-0 p-6">
      <div className="flex justify-center mb-8">
        <img src="/logo.png" alt="Company Logo" className="ml-15 w-40 h-auto" />
      </div>
      <div className="flex-col w-full max-w-[190px] p-3 space-y-3">
        <a
          href="/admin"
          className={`flex items-center gap-2 px-4 py-3 rounded border font-semibold text-sm transition duration-200 ${
            pathname === '/admin'
              ? 'bg-blue-900 text-white hover:bg-blue-950'
              : 'bg-blue-100 text-blue-950 hover:text-white hover:bg-blue-950'
          }`}
          style={{ width: "fit-content", minWidth: "170px" }}
        >
          <Package className="w-5 h-5 flex-shrink-0" />
          Orders Management
        </a>

        <a
          href="/admin/users"
          className={`flex items-center gap-2 px-4 py-3 rounded border font-semibold text-sm transition duration-200 ${
            pathname === '/admin/users'
              ? 'bg-blue-900 text-white hover:bg-blue-950'
              : 'bg-blue-100 text-blue-950 hover:text-white hover:bg-blue-950'
          }`}
          style={{ width: "fit-content", minWidth: "170px" }}
        >
          <Users className="w-5 h-5 flex-shrink-0" />
          User Management
        </a>

        <button
          onClick={() => router.push('/register')}
          className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-white font-semibold text-sm rounded border hover:bg-green-700"
          style={{ width: "fit-content", minWidth: "170px" }}
        >
          <UserPlus className="w-5 h-5 flex-shrink-0" />
          Add New User
        </button>
      </div>
    </div>

      {/* Main */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-black">Admin Dashboard</h1>
            <p className="text-lg font-semibold text-black">
              {session?.user?.name ? `Welcome back, ${session.user.name}!` : ''}
            </p>
          </div>
          <SignOutButton className="flex items-center gap-2 bg-blue-100 text-blue-950 font-semibold px-6 py-3 rounded border hover:text-white hover:bg-blue-950 transition duration-200">
            <LogOut className="w-5 h-5" /> Sign Out
          </SignOutButton>
        </div>

        {/* Content */}
        <div className="bg-white bg-opacity-90 rounded-lg shadow-lg p-6 h-full overflow-hidden flex flex-col">

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-blue-950">Admin Dashboard - User Management</h1>
          </div>

          {/* Search only */}
          <div className="flex items-center mb-4 gap-4 text-blue-950">
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                placeholder="Search by name or phone number..."
                className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>
          </div>

          {/* table */}
          <div className="flex-grow overflow-auto rounded-md border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              {/* table headers */}
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('lastName')}
                  >
                    <div className="flex items-center">
                      Last Name
                      {getSortIcon('lastName')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('firstName')}
                  >
                    <div className="flex items-center">
                      First Name
                      {getSortIcon('firstName')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('role')}
                  >
                    <div className="flex items-center">
                      Role
                      {getSortIcon('role')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('dateCreated')}
                  >
                    <div className="flex items-center">
                      Date Created
                      {getSortIcon('dateCreated')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {sortedUsers.map((user) => (
                  <tr 
                    key={user._id} 
                    onClick={() => handleRowClick(user)}
                    className={`transition-colors ${editingUserId === user._id ? 'bg-blue-50' : 'hover:bg-gray-50 cursor-pointer'}`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingUserId === user._id ? (
                        <input
                          type="text"
                          value={editFormData.lastName || ''}
                          onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        user.lastName || 'Not set'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingUserId === user._id ? (
                        <input
                          type="text"
                          value={editFormData.firstName || ''}
                          onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        user.firstName || 'Not set'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUserId === user._id ? (
                        <select
                          value={editFormData.role || 'customer'}
                          onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="customer">Customer</option>
                          <option value="salesman">Salesman</option>
                          <option value="driver">Driver</option>
                          <option value="secretary">Secretary</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role || 'customer'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(user.dateCreated || user.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingUserId === user._id ? (
                        <input
                          type="text"
                          value={editFormData.phoneNumber || ''}
                          onChange={(e) => setEditFormData({...editFormData, phoneNumber: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        user.phoneNumber || 'Not set'
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUserId === user._id ? (
                        <select
                          value={editFormData.accountStatus || 'active'}
                          onChange={(e) => setEditFormData({...editFormData, accountStatus: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                          <option value="pending">Pending</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.accountStatus, 'account')}`}>
                          {user.accountStatus || 'active'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUserId === user._id ? (
                        <select
                          value={editFormData.verificationStatus || 'unverified'}
                          onChange={(e) => setEditFormData({...editFormData, verificationStatus: e.target.value})}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="unverified">Unverified</option>
                          <option value="verified">Verified</option>
                          <option value="pending">Pending</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(user.verificationStatus, 'verification')}`}>
                          {user.verificationStatus || 'unverified'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingUserId === user._id ? (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEdit();
                            }}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEdit();
                            }}
                            className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={(e) => handleEditClick(e, user)}
                            className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => handleDeleteClick(e, user)}
                            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-blue-950">User Details</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* User Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-blue-950 mb-3">Personal Information</h3>
                <div className="space-y-2 text-gray-700">
                  <p><span className="font-medium">First Name:</span> {selectedUser.firstName || 'Not set'}</p>
                  <p><span className="font-medium">Last Name:</span> {selectedUser.lastName || 'Not set'}</p>
                  <p><span className="font-medium">Email:</span> {selectedUser.email}</p>
                  <p><span className="font-medium">Phone Number:</span> {selectedUser.phoneNumber || 'Not set'}</p>
                  <p><span className="font-medium">Date Created:</span> {formatDate(selectedUser.dateCreated || selectedUser.createdAt)}</p>
                  <p><span className="font-medium">User ID:</span> {selectedUser._id}</p>
                </div>
              </div>

              {/* Status Information */}
              <div>
                <h3 className="text-lg font-semibold text-blue-950 mb-3">Status Information</h3>
                <div className="space-y-2 text-gray-700">
                  <p>
                    <span className="font-medium">Role:</span> 
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedUser.role)}`}>
                      {selectedUser.role || 'customer'}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Account Status:</span> 
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.accountStatus, 'account')}`}>
                      {selectedUser.accountStatus || 'active'}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium">Verification Status:</span> 
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.verificationStatus, 'verification')}`}>
                      {selectedUser.verificationStatus || 'unverified'}
                    </span>
                  </p>
                  <p><span className="font-medium">Last Login:</span> {selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : "Never"}</p>
                </div>
              </div>

              {/* User Details Only - No Action Buttons */}
            </div>
          </div>
        </div>
      )}

      {/* Edit Confirmation Modal */}
      {showEditConfirmModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm User Update
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to save the changes to this user?
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowEditConfirmModal(false)} 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmSaveEdit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm User Deletion
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete user "{userToDelete?.firstName} {userToDelete?.lastName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => {
                  setShowDeleteConfirmModal(false);
                  setUserToDelete(null);
                }} 
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteUser}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
