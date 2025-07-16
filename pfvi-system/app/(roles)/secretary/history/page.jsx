'use client';

import { useState } from 'react';
import { Calendar, Search, Filter, ChevronDown, Download, Eye, ArrowUpDown, X } from "lucide-react";
import SignOutButton from "@/components/signout_button";

export default function OrderHistory() {
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [showPaymentFilter, setShowPaymentFilter] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleRowClick = (order) => {
  setSelectedOrder(order);
  setShowModal(true);
 };
 
  {/* remove if connected to actual archived orders db*/}
  const mockOrders = [
    { 
      _id: "1", 
      salesmanID: "Name",
      customerName: "Name", 
      invoice: null,
      paymentAmt: 15000.00,
      paymentMethod: "Cash",
      dateMade: "2025-07-08T00:00:00.000+00:00", 
      contactNumber: "09123456789",
      assignmentStatus: "Assigned",
      driverAssignedID: "Name",
      orderStatus: "Cancelled",
      dateDelivered: null,
      deliveryReceivedBy: null,
      paymentReceived: null,
      paymentReceivedBy: null,
      salesmanNotes: "Notes",
      driverNotes: "Notes",
      secretaryNotes: "Notes",
    },
    { 
      _id: "2", 
      salesmanID: "Name",
      customerName: "Name", 
      invoice: null,
      paymentAmt: 15000.00,
      paymentMethod: "Cash",
      dateMade: "2025-07-08T00:00:00.000+00:00", 
      contactNumber: "09123456789",
      assignmentStatus: "Assigned",
      driverAssignedID: "Name",
      orderStatus: "Delivered",
      dateDelivered: null,
      deliveryReceivedBy: null,
      paymentReceived: 15000,
      paymentReceivedBy: null,
      salesmanNotes: "Notes",
      driverNotes: "Notes",
      secretaryNotes: "Notes",
    },
    { 
      _id: "3", 
      salesmanID: "Name",
      customerName: "Name", 
      invoice: null,
      paymentAmt: 15000.00,
      paymentMethod: "Cash",
      dateMade: "2025-07-08T00:00:00.000+00:00", 
      contactNumber: "09123456789",
      assignmentStatus: "Assigned",
      driverAssignedID: "Name",
      orderStatus: "Cancelled",
      dateDelivered: null,
      deliveryReceivedBy: null,
      paymentReceived: null,
      paymentReceivedBy: null,
      salesmanNotes: "Notes",
      driverNotes: "Notes",
      secretaryNotes: "Notes",
    },
    { 
      _id: "4", 
      salesmanID: "Name",
      customerName: "Name", 
      invoice: null,
      paymentAmt: 15000.00,
      paymentMethod: "Cash",
      dateMade: "2025-07-08T00:00:00.000+00:00", 
      contactNumber: "09123456789",
      assignmentStatus: "Assigned",
      driverAssignedID: "Name",
      orderStatus: "Cancelled",
      dateDelivered: null,
      deliveryReceivedBy: null,
      paymentReceived: null,
      paymentReceivedBy: null,
      salesmanNotes: "Notes",
      driverNotes: "Notes",
      secretaryNotes: "Notes",
    },

  ];

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function formatCurrency(amount) {
    if (amount === null || amount === undefined) return "Not set";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
    })
      .format(amount)
      .replace("PHP", "₱");
  }

  function getPaymentStatus(order) {
    return order.paymentReceived ? "Paid" : "Pending";
  }

  function getStatusColor(status) {
    if (!status) return "bg-gray-100 text-gray-800 border-gray-200"
    
    status = status.toLowerCase()
    if (status.includes("cancel")) 
      return "bg-red-100 text-red-800 border-red-200"
    if (status.includes("delivered") || status.includes("complete")) 
      return "bg-green-100 text-green-800 border-green-200"
    if (status.includes("transit") || status.includes("picked up")) 
      return "bg-blue-100 text-blue-800 border-blue-200"
    if (status.includes("being prepared")) 
      return "bg-yellow-100 text-yellow-800 border-yellow-200"
    if (status.includes("deferred")) 
      return "bg-purple-100 text-purple-800 border-purple-200"
    
    return "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <div className="flex h-screen bg-[url('/background.jpg')] bg-cover bg-center text-white overflow-hidden">
      <div className="w-50 bg-opacity-0 p-6">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Company Logo" className="ml-15 w-40 h-auto" />
        </div>

        <div className="flex-col w-50 p-3 space-y-3">
          <SignOutButton 
            className="w-40 bg-blue-100 text-blue-950 font-semibold block px-6 py-3 rounded border hover:text-white hover:bg-blue-950 transition duration-200 text-center" 
          />

          <a
            href="/secretary"
            className="w-40 bg-blue-100 text-blue-950 font-semibold block px-6 py-3 rounded border hover:text-white hover:bg-blue-950 transition duration-200 text-center"
          >
            Current Orders
          </a>

          <a
            href="/secretary/history"
            className="w-40 bg-blue-900 text-white font-semibold block px-6 py-3 rounded border hover:text-white hover:bg-blue-950 transition duration-200 text-center"
          >
            Order History
          </a>
        </div>
      </div>

      {/* history content */}
      <div className="flex-1 p-6 overflow-y-auto">
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
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            </div>


            {/* payment */}
            <div className="relative">
              <button 
                onClick={() => setShowPaymentFilter(!showPaymentFilter)}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Payment Status: All
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
              {showPaymentFilter && (
                <div className="absolute mt-1 w-32 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    {['All', 'Paid', 'Pending'].map((status) => (
                      <button
                        key={status}
                        className="block px-4 py-2 text-sm text-blue-900 w-full text-left hover:bg-blue-50"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* status */}
            <div className="relative">
              <button 
                onClick={() => setShowStatusFilter(!showStatusFilter)}
                className="px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md flex items-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Fulfillment Status: All
                <ChevronDown className="h-4 w-4 ml-2" />
              </button>
              {showStatusFilter && (
                <div className="absolute mt-1 w-56 bg-white rounded-md shadow-lg z-10">
                  <div className="py-1">
                    {['All', 'Being Prepared', 'Picked Up', 'In Transit', 'Delivered', 'Deferred', 'Cancelled'].map((status) => (
                      <button
                        key={status}
                        className="block px-4 py-2 text-sm text-blue-900 w-full text-left hover:bg-blue-50"
                      >
                        {status}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                    <div className="flex items-center">
                      Order ID
                      <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                    <div className="flex items-center">
                      Date
                      <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                    <div className="flex items-center">
                      Customer
                      <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
                    <div className="flex items-center">
                      Amount
                      <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />
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
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {mockOrders.map((order) => (
                  <tr 
                    key={order._id} 
                    onClick={() => handleRowClick(order)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors" 
                  >
                      
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 font-mono">
                      #{order._id}
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
                      {order.driverAssignedID}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.salesmanID}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    {showModal && selectedOrder && (
          <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-blue-950">Order Details</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-blue-950 mb-3">Order Information</h3>
                <div className="space-y-2 text-gray-700">
                  <p><span className="font-medium">Order ID:</span> {selectedOrder._id}</p>
                  <p><span className="font-medium">Date:</span> {formatDate(selectedOrder.dateMade)}</p>
                  <p><span className="font-medium">Customer:</span> {selectedOrder.customerName}</p>
                  <p><span className="font-medium">Contact:</span> {selectedOrder.contactNumber}</p>
                  <p><span className="font-medium">Amount:</span> {formatCurrency(selectedOrder.paymentAmt)}</p>
                  <p><span className="font-medium">Payment Method:</span> {selectedOrder.paymentMethod}</p>
                </div>
              </div>

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
                  <p><span className="font-medium">Salesman:</span> {selectedOrder.salesmanID}</p>
                  <p><span className="font-medium">Driver:</span> {selectedOrder.driverAssignedID}</p>
                  <p><span className="font-medium">Delivery Date:</span> {selectedOrder.dateDelivered ? formatDate(selectedOrder.dateDelivered) : "Not delivered"}</p>
                  <p><span className="font-medium">Received By:</span> {selectedOrder.deliveryReceivedBy || "Not yet received"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}