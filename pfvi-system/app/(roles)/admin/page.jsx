'use client';

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { Calendar, Search, ArrowUpDown, X, Package, UserPlus, LogOut, Users } from "lucide-react";
import SignOutButton from "@/components/signout_button";
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter();
  const pathname = usePathname();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [orders, setOrders] = useState([])
  const hasFetchedRef = useRef(false)
  const [searchQuery, setSearchQuery] = useState('');

  // EDIT AND DELETE STATES
  const [editFormData, setEditFormData] = useState({});
  const [showEditConfirmModal, setShowEditConfirmModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [drivers, setDrivers] = useState([]);



  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders`);
        const data = await res.json()
        setOrders(data)
      } catch (err) {
        console.error("Failed to fetch orders:", err)
      }
    }
    if (status === "authenticated" && session && document.visibilityState === "visible" && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchOrders()
    }
  }, [status, session])

  // Fetch Drivers when edit modal opens
  const fetchDrivers = async () => {
    try {
      const res = await fetch(`/api/users`);
      const data = await res.json()
      const driverUsers = data.filter(user => user.role === 'driver');
      setDrivers(driverUsers);
    } catch (err) {
      console.error("Failed to fetch drivers:", err)
    }
  };

  const handleRowClick = (order) => {
    if (showEditConfirmModal) return; // Don't open modal if editing
    setSelectedOrder(order);
    setShowModal(true);
  };

  // EDIT HANDLERS - using modal instead of inline editing
  const handleEditClick = async (e, order) => {
    e.stopPropagation(); // Prevent row click
    setSelectedOrder(order);
    setEditFormData({
      customerName: order.customerName || '',
      contactNumber: order.contactNumber || '',
      paymentAmt: order.paymentAmt || '',
      paymentMethod: order.paymentMethod || 'Cash',
      orderStatus: order.orderStatus || 'Being Prepared',
      paymentReceived: order.paymentReceived || false,
      assignmentStatus: order.assignmentStatus || 'No Driver Assigned',
      driverAssignedID: order.driverAssignedID || order.driver?._id || ''
    });
    await fetchDrivers(); // Fetch available drivers
    setShowEditConfirmModal(true);
  };

  const handleCancelEdit = () => {
    setEditFormData({});
    setShowEditConfirmModal(false);
  };

  const handleSaveEdit = () => {
    // This will be called from the modal
    confirmSaveEdit();
  };

  const confirmSaveEdit = async () => {
    try {
      // Automatically set assignment status based on driver selection
      const updatedFormData = {
        ...editFormData,
        assignmentStatus: editFormData.driverAssignedID ? 'Driver Assigned' : 'No Driver Assigned'
      };

      const response = await fetch(`/api/orders`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: selectedOrder._id,
          ...updatedFormData
        }),
      });
      if (response.ok) {
        // Refresh orders to get updated driver info
        const res = await fetch(`/api/orders`);
        const data = await res.json()
        setOrders(data);
        
        setSelectedOrder(null);
        setEditFormData({});
        setShowEditConfirmModal(false);
        toast.success('Order updated successfully');
      } else {
        toast.error('Failed to update order');
      }
    } catch {
      toast.error('Update request failed');
    }
  };

  // DELETE HANDLERS
  const handleDeleteClick = (e, order) => {
    e.stopPropagation(); // Prevent row click
    setOrderToDelete(order);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteOrder = async () => {
    try {
      const response = await fetch(`/api/orders?orderId=${orderToDelete._id}`, { 
        method: 'DELETE' 
      });
      if (response.ok) {
        setOrders(prev => prev.filter(order => order._id !== orderToDelete._id));
        setShowDeleteConfirmModal(false);
        setOrderToDelete(null);
        toast.success('Order deleted successfully');
      } else {
        toast.error('Failed to delete order');
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

  const filteredOrders = orders.filter(order => {
    if (searchQuery.trim() && !order.customerName?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
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

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (!sortConfig.key) return 0;
    let aValue = a[sortConfig.key], bValue = b[sortConfig.key];
    if (sortConfig.key === 'paymentAmt') { aValue = parseFloat(aValue) || 0; bValue = parseFloat(bValue) || 0; }
    else if (sortConfig.key === 'dateMade') { aValue = new Date(aValue); bValue = new Date(bValue); }
    else if (typeof aValue === 'string') { aValue = aValue.toLowerCase(); bValue = bValue.toLowerCase(); }
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  }
  function formatCurrency(amount) {
    if (amount == null) return "Not set";
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(amount).replace("PHP", "₱");
  }
  function getPaymentStatus(order) {
    return order.paymentReceived ? "Paid" : "Pending";
  }
  function getStatusColor(status) {
    if (!status) return "bg-gray-100 text-gray-800 border-gray-200";
    status = status.toLowerCase();
    if (status.includes("cancel")) return "bg-red-100 text-red-800 border-red-200";
    if (status.includes("delivered") || status.includes("complete")) return "bg-green-100 text-green-800 border-green-200";
    if (status.includes("transit") || status.includes("picked up")) return "bg-blue-100 text-blue-800 border-blue-200";
    if (status.includes("being prepared")) return "bg-yellow-100 text-yellow-800 border-yellow-200";
    if (status.includes("deferred")) return "bg-purple-100 text-purple-800 border-purple-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  }
  function getDriverName(order) {
    return order.driver?.firstName ? `${order.driver.firstName} ${order.driver.lastName}` : "No driver assigned";
  }
  function getSalesmanName(order) {
    return order.salesman?.firstName ? `${order.salesman.firstName} ${order.salesman.lastName}` : "No salesman assigned";
  }




  return (
    <div className="flex h-screen bg-[url('/background.jpg')] bg-cover bg-center overflow-hidden">
      {/* Sidebar */}
      <div className="w-50 bg-opacity-0 p-6">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Company Logo" className="ml-15 w-40 h-auto" />
        </div>
        <div className="flex-col w-50 p-3 space-y-3">
          <a href="/admin" className={`flex items-center gap-2 w-40 px-6 py-3 rounded border font-semibold transition duration-200 ${pathname === '/admin' ? 'bg-blue-900 text-white hover:bg-blue-950' : 'bg-blue-100 text-blue-950 hover:text-white hover:bg-blue-950'}`}>
            <Package className="w-5 h-5" /> Orders Management
          </a>
          <a href="/admin/users" className={`flex items-center gap-2 w-40 px-6 py-3 rounded border font-semibold transition duration-200 ${pathname === '/admin/users' ? 'bg-blue-900 text-white hover:bg-blue-950' : 'bg-blue-100 text-blue-950 hover:text-white hover:bg-blue-950'}`}>
            <Users className="w-5 h-5" /> User Management
          </a>
          <button onClick={() => router.push('/admin')} className="flex items-center gap-2 w-40 bg-blue-500 text-white font-semibold px-6 py-3 rounded border hover:bg-green-700 text-left">
            <UserPlus className="w-5 h-5" /> Add New User
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

      {/* History content */}
      <div className="bg-white bg-opacity-90 rounded-lg shadow-lg p-6 h-full overflow-hidden flex flex-col">

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-blue-950">Admin Dashboard - Orders Management</h1>
          </div>

          {/* Search only */}
          <div className="flex items-center mb-4 gap-4 text-blue-950">
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                placeholder="Search by customer name..."
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
                    onClick={() => handleSort('orderNumber')}
                  >
                    <div className="flex items-center">
                      Order #
                      {getSortIcon('orderNumber')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('dateMade')}
                  >
                    <div className="flex items-center">
                      Date
                      {getSortIcon('dateMade')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('customerName')}
                  >
                    <div className="flex items-center">
                      Customer
                      {getSortIcon('customerName')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('paymentAmt')}
                  >
                    <div className="flex items-center">
                      Amount
                      {getSortIcon('paymentAmt')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {sortedOrders.map((order) => (
                  <tr 
                    key={order._id} 
                    onClick={() => handleRowClick(order)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                      
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                      #{order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        {formatDate(order.dateMade)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customerName || 'Not set'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.contactNumber || 'Not set'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(order.paymentAmt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.paymentMethod || 'Not set'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        getPaymentStatus(order) === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getPaymentStatus(order)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => handleEditClick(e, order)}
                          className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(e, order)}
                          className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

            {/* Order Details Modal */}
            {showModal && selectedOrder && (
              <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-2xl p-4 sm:p-6 w-full max-w-sm sm:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto">
                  
                  {/* Header */}
                  <div className="flex justify-between items-center mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-blue-950">Order Details</h2>
                    <button 
                      onClick={() => setShowModal(false)}
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                  </div>

                  {/* Order Info & Status Info */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Order Information */}
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-blue-950 mb-3">Order Information</h3>
                      <div className="space-y-2 text-gray-700 text-sm sm:text-base">
                        <p><span className="font-medium">Order Number:</span> #{selectedOrder.orderNumber}</p>
                        <p><span className="font-medium">Date:</span> {formatDate(selectedOrder.dateMade)}</p>
                        <p><span className="font-medium">Customer:</span> {selectedOrder.customerName}</p>
                        <p><span className="font-medium">Contact:</span> {selectedOrder.contactNumber}</p>
                        <p><span className="font-medium">Amount:</span> {formatCurrency(selectedOrder.paymentAmt)}</p>
                        <p><span className="font-medium">Payment Method:</span> {selectedOrder.paymentMethod}</p>
                        <p className="break-all"><span className="font-medium">Order ID:</span> {selectedOrder._id}</p>
                      </div>
                    </div>

                    {/* Status Information */}
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-blue-950 mb-3">Status Information</h3>
                      <div className="space-y-2 text-gray-700 text-sm sm:text-base">
                        <p>
                          <span className="font-medium">Payment Status:</span> 
                          <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                            getPaymentStatus(selectedOrder) === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {getPaymentStatus(selectedOrder)}
                          </span>
                        </p>
                        <p>
                          <span className="font-medium">Order Status:</span> 
                          <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.orderStatus)}`}>
                            {selectedOrder.orderStatus}
                          </span>
                        </p>
                        <p>
                          <span className="font-medium">Assignment Status:</span> 
                          <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                            selectedOrder.assignmentStatus === 'Driver Assigned' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {selectedOrder.assignmentStatus || 'No Driver Assigned'}
                          </span>
                        </p>
                        <p><span className="font-medium">Salesman:</span> {getSalesmanName(selectedOrder)}</p>
                        <p><span className="font-medium">Driver:</span> {getDriverName(selectedOrder)}</p>
                        <p><span className="font-medium">Delivery Date:</span> {selectedOrder.dateDelivered ? formatDate(selectedOrder.dateDelivered) : "Not delivered"}</p>
                        <p><span className="font-medium">Received By:</span> {selectedOrder.deliveryReceivedBy || "Not yet received"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

      {/* Edit Order Modal */}
      {showEditConfirmModal && selectedOrder && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-lg lg:max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
              Edit Order #{selectedOrder.orderNumber}
            </h2>
            
            <div className="space-y-3 sm:space-y-4">
              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={editFormData.customerName || ''}
                  onChange={(e) => setEditFormData({...editFormData, customerName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>

              {/* Contact Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input
                  type="text"
                  value={editFormData.contactNumber || ''}
                  onChange={(e) => setEditFormData({...editFormData, contactNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>

              {/* Payment Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
                <input
                  type="number"
                  value={editFormData.paymentAmt || ''}
                  onChange={(e) => setEditFormData({...editFormData, paymentAmt: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  value={editFormData.paymentMethod || 'Cash'}
                  onChange={(e) => setEditFormData({...editFormData, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Check">Check</option>
                </select>
              </div>

              {/* Payment Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                <select
                  value={editFormData.paymentReceived ? 'true' : 'false'}
                  onChange={(e) => setEditFormData({...editFormData, paymentReceived: e.target.value === 'true'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="false">Pending</option>
                  <option value="true">Paid</option>
                </select>
              </div>

              {/* Order Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Order Status</label>
                <select
                  value={editFormData.orderStatus || 'Being Prepared'}
                  onChange={(e) => setEditFormData({...editFormData, orderStatus: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="Being Prepared">Being Prepared</option>
                  <option value="Picked up">Picked up</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Deferred">Deferred</option>
                </select>
              </div>

              {/* Driver Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Driver</label>
                <select
                  value={editFormData.driverAssignedID || ''}
                  onChange={(e) => {
                    setEditFormData({
                      ...editFormData, 
                      driverAssignedID: e.target.value,
                      assignmentStatus: e.target.value ? 'Driver Assigned' : 'No Driver Assigned'
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="">No Driver Selected</option>
                  {drivers.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.firstName} {driver.lastName}
                    </option>
                  ))}
                </select>
                {/* Show current assignment status */}
                <p className="text-xs text-gray-500 mt-1">
                  Status: {editFormData.driverAssignedID ? 'Driver Assigned' : 'No Driver Assigned'}
                </p>
              </div>

              {/* Additional Info Display */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-200">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-600"><span className="font-medium">Salesman:</span> {getSalesmanName(selectedOrder)}</p>
                  <p className="text-xs sm:text-sm text-gray-600"><span className="font-medium">Driver:</span> {getDriverName(selectedOrder)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm text-gray-600"><span className="font-medium">Order Date:</span> {formatDate(selectedOrder.dateMade)}</p>
                  <p className="text-xs sm:text-sm text-gray-600 break-all"><span className="font-medium">Order ID:</span> {selectedOrder._id}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button 
                onClick={handleCancelEdit} 
                className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm sm:text-base order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm sm:text-base order-1 sm:order-2"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}            {/* Delete Confirmation Modal */}
            {showDeleteConfirmModal && (
              <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                    Confirm Order Deletion
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                    Are you sure you want to delete order #{orderToDelete?.orderNumber}? This action cannot be undone.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                    <button 
                      onClick={() => {
                        setShowDeleteConfirmModal(false);
                        setOrderToDelete(null);
                      }} 
                      className="w-full sm:w-auto px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm sm:text-base order-2 sm:order-1"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDeleteOrder}
                      className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm sm:text-base order-1 sm:order-2"
                    >
                      Delete Order
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }