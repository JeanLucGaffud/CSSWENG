'use client';

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { Calendar, Search, Filter, ChevronDown, ArrowUpDown, X, Package, History, UserPlus, LogOut } from "lucide-react";
import SignOutButton from "@/components/signout_button";
import toast from 'react-hot-toast';

export default function OrderHistory() {
  const { data: session, status } = useSession()
  const router = useRouter();
  const pathname = usePathname();

  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('All');
  const [selectedFulfillmentStatus, setSelectedFulfillmentStatus] = useState('All');
  const [selectedMonth, setSelectedMonth] = useState('All');
  const [selectedSalesman, setSelectedSalesman] = useState('All');
  const [selectedDriver, setSelectedDriver] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [orders, setOrders] = useState([])
  const hasFetchedRef = useRef(false)
  const [showPaymentFilter, setShowPaymentFilter] = useState(false);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showMonthFilter, setShowMonthFilter] = useState(false);
  const [showSalesmanFilter, setShowSalesmanFilter] = useState(false);
  const [showDriverFilter, setShowDriverFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // NEW STATES FOR CONFIRMATION MODAL
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Fetch Orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/fetchSecretaryHistory`);
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

  const handleRowClick = (order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.filter-dropdown')) {
        closeAllDropdowns();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const closeAllDropdowns = () => {
    setShowPaymentFilter(false);
    setShowStatusFilter(false);
    setShowMonthFilter(false);
    setShowSalesmanFilter(false);
    setShowDriverFilter(false);
  };

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

  const filteredOrders = orders.filter(order => {
    if (selectedPaymentStatus !== 'All' && getPaymentStatus(order) !== selectedPaymentStatus) return false;
    if (selectedFulfillmentStatus !== 'All' && order.orderStatus !== selectedFulfillmentStatus) return false;
    if (searchQuery.trim() && !order.customerName?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedMonth !== 'All') {
      const orderMonth = new Date(order.dateMade).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      if (orderMonth !== selectedMonth) return false;
    }
    if (selectedSalesman !== 'All' && getSalesmanName(order) !== selectedSalesman) return false;
    if (selectedDriver !== 'All' && getDriverName(order) !== selectedDriver) return false;
    return true;
  });

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
    return order.driverAssignedID?.firstName ? `${order.driverAssignedID.firstName} ${order.driverAssignedID.lastName}` : "No driver assigned";
  }
  function getSalesmanName(order) {
    return order.salesmanID?.firstName ? `${order.salesmanID.firstName} ${order.salesmanID.lastName}` : "No salesman assigned";
  }
  const getUniqueMonths = () => ['All', ...new Set(orders.map(o => new Date(o.dateMade).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })).filter(m => m !== 'Invalid Date'))].sort();
  const getUniqueSalesmen = () => ['All', ...new Set(orders.map(getSalesmanName).filter(n => n !== 'No salesman assigned'))].sort();
  const getUniqueDrivers = () => ['All', ...new Set(orders.map(getDriverName).filter(n => n !== 'No driver assigned'))].sort();

  // DELETE handler
  const handleDeleteOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/orders?orderId=${orderId}`, { method: 'DELETE' });
      if (response.ok) {
        setOrders(prev => prev.filter(order => order._id !== orderId));
        setShowModal(false);
        setSelectedOrder(null);
        toast.success('Order deleted successfully');
      } else {
        toast.error('Failed to delete order');
      }
    } catch {
      toast.error('Delete request failed');
    }
  };

  // RESTORE handler
  const handleRestoreOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/orders`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, orderStatus: 'Being Prepared' }),
      });
      if (response.ok) {
        setOrders(prev => prev.filter(order => order._id !== orderId));
        setShowModal(false);
        setSelectedOrder(null);
        toast.success('Order restored to current orders');
      } else {
        toast.error('Failed to restore order');
      }
    } catch {
      toast.error('Restore request failed');
    }
  };


  return (
    <div className="flex h-screen bg-[url('/background.jpg')] bg-cover bg-center overflow-hidden">
      {/* Sidebar */}
      <div className="w-50 bg-opacity-0 p-6">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Company Logo" className="ml-15 w-40 h-auto" />
        </div>
        <div className="ml-2 flex-col w-50 p-3 space-y-3">
          <a href="/secretary" className={`flex items-center gap-2 w-40 px-6 py-3 rounded border font-semibold transition duration-200 ${pathname === '/secretary' ? 'bg-blue-900 text-white hover:bg-blue-950' : 'bg-blue-100 text-blue-950 hover:text-white hover:bg-blue-950'}`}>
            <Package className="w-5 h-5" /> Current Orders
          </a>
          <a href="/secretary/history" className={`flex items-center gap-2 w-40 px-6 py-3 rounded border font-semibold transition duration-200 ${pathname === '/secretary/history' ? 'bg-blue-900 text-white hover:bg-blue-950' : 'bg-blue-100 text-blue-950 hover:text-white hover:bg-blue-950'}`}>
            <History className="w-5 h-5" /> Order History
          </a>
          <button onClick={() => router.push('/register')} className="flex items-center gap-2 w-40 bg-blue-500 text-white font-semibold px-6 py-3 rounded border hover:bg-green-700 text-left">
            <UserPlus className="w-5 h-5" /> Add New User
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-black">Order History</h1>
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
            <h1 className="text-2xl font-bold text-blue-950">Order History</h1>
          </div>

          {/* filters */}
          <div className="flex flex-wrap items-center mb-4 gap-4 text-blue-950">
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


            {/* payment */}
            <div className="relative filter-dropdown">
              <button 
                onClick={() => {
                  closeAllDropdowns();
                  setShowPaymentFilter(!showPaymentFilter);
                }}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Payment Status: {selectedPaymentStatus}
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
              {showPaymentFilter && (
                <div className="absolute mt-1 w-32 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    {['All', 'Paid', 'Pending'].map((status) => (
                      <button
                        key={status}
                        className={`block px-4 py-2 text-sm w-full text-left hover:bg-blue-50 ${
                          selectedPaymentStatus === status ? 'bg-blue-100 text-blue-900 font-medium' : 'text-blue-900'
                        }`}
                        onClick={() => {
                          setSelectedPaymentStatus(status);
                          setShowPaymentFilter(false);
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* status */}
            <div className="relative filter-dropdown">
              <button 
                onClick={() => {
                  closeAllDropdowns();
                  setShowStatusFilter(!showStatusFilter);
                }}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Fulfillment Status: {selectedFulfillmentStatus}
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
              {showStatusFilter && (
                <div className="absolute mt-1 w-32 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    {['All', 'Delivered', 'Cancelled'].map((status) => (
                      <button
                        key={status}
                        className={`block px-4 py-2 text-sm w-full text-left hover:bg-blue-50 ${
                          selectedFulfillmentStatus === status ? 'bg-blue-100 text-blue-900 font-medium' : 'text-blue-900'
                        }`}
                        onClick={() => {
                          setSelectedFulfillmentStatus(status);
                          setShowStatusFilter(false);
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* month */}
            <div className="relative filter-dropdown">
              <button 
                onClick={() => {
                  closeAllDropdowns();
                  setShowMonthFilter(!showMonthFilter);
                }}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Month: {selectedMonth}
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
              {showMonthFilter && (
                <div className="absolute mt-1 w-48 bg-white rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                  <div className="py-1">
                    {getUniqueMonths().map((month) => (
                      <button
                        key={month}
                        className={`block px-4 py-2 text-sm w-full text-left hover:bg-blue-50 ${
                          selectedMonth === month ? 'bg-blue-100 text-blue-900 font-medium' : 'text-blue-900'
                        }`}
                        onClick={() => {
                          setSelectedMonth(month);
                          setShowMonthFilter(false);
                        }}
                      >
                        {month}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* salesman */}
            <div className="relative filter-dropdown">
              <button 
                onClick={() => {
                  closeAllDropdowns();
                  setShowSalesmanFilter(!showSalesmanFilter);
                }}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Salesman: {selectedSalesman}
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
              {showSalesmanFilter && (
                <div className="absolute mt-1 w-48 bg-white rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                  <div className="py-1">
                    {getUniqueSalesmen().map((salesman) => (
                      <button
                        key={salesman}
                        className={`block px-4 py-2 text-sm w-full text-left hover:bg-blue-50 ${
                          selectedSalesman === salesman ? 'bg-blue-100 text-blue-900 font-medium' : 'text-blue-900'
                        }`}
                        onClick={() => {
                          setSelectedSalesman(salesman);
                          setShowSalesmanFilter(false);
                        }}
                      >
                        {salesman}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* driver */}
            <div className="relative filter-dropdown">
              <button 
                onClick={() => {
                  closeAllDropdowns();
                  setShowDriverFilter(!showDriverFilter);
                }}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Driver: {selectedDriver}
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
              {showDriverFilter && (
                <div className="absolute mt-1 w-48 bg-white rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                  <div className="py-1">
                    {getUniqueDrivers().map((driver) => (
                      <button
                        key={driver}
                        className={`block px-4 py-2 text-sm w-full text-left hover:bg-blue-50 ${
                          selectedDriver === driver ? 'bg-blue-100 text-blue-900 font-medium' : 'text-blue-900'
                        }`}
                        onClick={() => {
                          setSelectedDriver(driver);
                          setShowDriverFilter(false);
                        }}
                      >
                        {driver}
                      </button>
                    ))}
                  </div>
                </div>
              )}
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
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fulfillment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Delivery Driver
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salesman
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('_id')}
                  >
                    <div className="flex items-center">
                      Order ID
                      {getSortIcon('_id') }
                    </div>
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
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      {formatCurrency(order.paymentAmt)}
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
                      {getDriverName(order)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getSalesmanName(order)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500 font-mono">
                      {order._id}
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
              <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                  
                  {/* Header */}
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-blue-950">Order Details</h2>
                    <button 
                      onClick={() => setShowModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Order Info & Status Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Order Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-blue-950 mb-3">Order Information</h3>
                      <div className="space-y-2 text-gray-700">
                        <p><span className="font-medium">Order Number:</span> #{selectedOrder.orderNumber}</p>
                        <p><span className="font-medium">Date:</span> {formatDate(selectedOrder.dateMade)}</p>
                        <p><span className="font-medium">Customer:</span> {selectedOrder.customerName}</p>
                        <p><span className="font-medium">Contact:</span> {selectedOrder.contactNumber}</p>
                        <p><span className="font-medium">Amount:</span> {formatCurrency(selectedOrder.paymentAmt)}</p>
                        <p><span className="font-medium">Payment Method:</span> {selectedOrder.paymentMethod}</p>
                        <p><span className="font-medium">Order ID:</span> {selectedOrder._id}</p>
                      </div>
                    </div>

                    {/* Status Information */}
                    <div>
                      <h3 className="text-lg font-semibold text-blue-950 mb-3">Status Information</h3>
                      <div className="space-y-2 text-gray-700">
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
                        <p><span className="font-medium">Salesman:</span> {getSalesmanName(selectedOrder)}</p>
                        <p><span className="font-medium">Driver:</span> {getDriverName(selectedOrder)}</p>
                        <p><span className="font-medium">Delivery Date:</span> {selectedOrder.dateDelivered ? formatDate(selectedOrder.dateDelivered) : "Not delivered"}</p>
                        <p><span className="font-medium">Received By:</span> {selectedOrder.deliveryReceivedBy || "Not yet received"}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="col-span-2 mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                      <button 
                        onClick={() => { setConfirmAction('delete'); setShowConfirmModal(true); }} 
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
                      >
                        Delete Order
                      </button>
                      <button 
                        onClick={() => { setConfirmAction('restore'); setShowConfirmModal(true); }} 
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors flex items-center gap-2"
                      >
                        Restore to Current Orders
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Modal */}
            {showConfirmModal && (
              <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    {confirmAction === 'delete'
                      ? 'Are you sure you want to delete this order? This action cannot be undone.'
                      : 'Are you sure you want to restore this order to current orders? This will change the order status to "Being Prepared"'}
                  </h2>
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => setShowConfirmModal(false)} 
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (confirmAction === 'delete') handleDeleteOrder(selectedOrder._id);
                        else handleRestoreOrder(selectedOrder._id);
                        setShowConfirmModal(false);
                      }}
                      className={`px-4 py-2 rounded text-white ${
                        confirmAction === 'delete' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      }