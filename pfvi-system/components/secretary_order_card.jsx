"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Phone, DollarSign, Truck, FileText, ChevronDown, ChevronUp, Copy, Check, X, Edit3 } from "lucide-react"

import AssignDriverModal from "./assignDriverModal";

import toast from "react-hot-toast";

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

function formatDate(dateString) {
  if (!dateString) return "Not set"
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined) return "Not set"
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  })
    .format(amount)
    .replace("PHP", "₱")
}

  export default function SecretaryOrderCard({ order = orderData, onRefresh }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [showInvoiceModal, setShowInvoiceModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [noteInput, setNoteInput] = useState('');
    const [invoiceInput, setInvoiceInput] = useState('');

    const [editedOrder, setEditedOrder] = useState({
      customerName: order.customerName || '',
      dateMade: order.dateMade ? order.dateMade.split("T")[0] : '',
      orderStatus: order.orderStatus || '',
      contactNumber: order.contactNumber || '',
      dateDelivered: order.dateDelivered || '',
      deliveryReceivedBy: order.deliveryReceivedBy || '',
      invoice: order.invoice || '',
      paymentAmt: order.paymentAmt || 0,
      paymentMethod: order.paymentMethod || '',
      paymentReceived: order.paymentReceived || '',
      paymentReceivedBy: order.paymentReceivedBy || '',
      salesmanNotes: order.salesmanNotes || '',
      driverNotes: order.driverNotes || '',
      secretaryNotes: order.secretaryNotes || ''
    });

    const handleCardClick = () => {
      if (!isExpanded && !isEditing) setIsExpanded(true); // only allow expanding on full-card click, not when editing
    };
  const router = useRouter();

    const toggleExpanded = () => {
      if (!isEditing) {
        setIsExpanded((prev) => !prev); // allow toggle on chevron only when not editing
      }
    };

  const editOrder = (orderId) => {
    router.push(`/secretary/orderEdit/${orderId}`)
  }

  const handleEditToggle = (e) => {
    e.stopPropagation();
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Ensure card is expanded when entering edit mode
      setIsExpanded(true);
      // Reset edited values to current order values when entering edit mode
      setEditedOrder({
        customerName: order.customerName || '',
        dateMade: order.dateMade ? order.dateMade.split("T")[0] : '',
        orderStatus: order.orderStatus || '',
        contactNumber: order.contactNumber || '',
        dateDelivered: order.dateDelivered || '',
        deliveryReceivedBy: order.deliveryReceivedBy || '',
        invoice: order.invoice || '',
        paymentReceived: order.paymentReceived || '',
        paymentReceivedBy: order.paymentReceivedBy || '',
        salesmanNotes: order.salesmanNotes || '',
        driverNotes: order.driverNotes || '',
        secretaryNotes: order.secretaryNotes || ''
      });
    }
  }

  const handleSaveChanges = async (e) => {
    e.stopPropagation();
    
    toast.promise(
      (async () => {
        const res = await fetch("/api/orders", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order._id,
            ...editedOrder,
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to update order.");
        }

        return res.json();
      })(),
      {
        loading: "Saving changes...",
        success: "Order updated successfully!",
        error: (err) => err.message || "Update failed.",
      }
    ).then(() => {
      setIsEditing(false);
      if (typeof onRefresh === "function") {
        onRefresh();
      }
    });
  }

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setIsEditing(false);
    // Reset to original values
    setEditedOrder({
      customerName: order.customerName || '',
      dateMade: order.dateMade ? order.dateMade.split("T")[0] : '',
      orderStatus: order.orderStatus || '',
      contactNumber: order.contactNumber || '',
      dateDelivered: order.dateDelivered || '',
      deliveryReceivedBy: order.deliveryReceivedBy || '',
      invoice: order.invoice || '',
      paymentReceived: order.paymentReceived || '',
      paymentReceivedBy: order.paymentReceivedBy || '',
      salesmanNotes: order.salesmanNotes || '',
      driverNotes: order.driverNotes || '',
      secretaryNotes: order.secretaryNotes || ''
    });
  }

  const handleAddNote = async () => {
    if (!noteInput.trim()) return;

    toast.promise(
      (async () => {
        const res = await fetch("/api/orders", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order._id,
            secretaryNotes: noteInput.trim(),
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to add note.");
        }

        return res.json();
      })(),
      {
        loading: "Adding note...",
        success: "Note added successfully!",
        error: (err) => err.message || "Failed to add note.",
      }
    ).then(() => {
      setShowNoteModal(false);
      setNoteInput('');
      if (typeof onRefresh === "function") {
        onRefresh();
      }
    });
  }

  const handleAddInvoice = async () => {
    if (!invoiceInput.trim()) return;

    toast.promise(
      (async () => {
        const res = await fetch("/api/orders", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order._id,
            invoice: invoiceInput.trim(),
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to add invoice.");
        }

        return res.json();
      })(),
      {
        loading: "Adding invoice...",
        success: "Invoice added successfully!",
        error: (err) => err.message || "Failed to add invoice.",
      }
    ).then(() => {
      setShowInvoiceModal(false);
      setInvoiceInput('');
      if (typeof onRefresh === "function") {
        onRefresh();
      }
    });
  }

    return (
      <div
        className={`w-full max-w-6xl mx-auto cursor-pointer hover:shadow-md transition-all duration-200 border-2 rounded-lg bg-white shadow-sm mb-4 ${
          isEditing 
            ? 'border-blue-400 shadow-lg bg-blue-50' 
            : 'hover:border-blue-200'
        }`}
        onClick={handleCardClick}
      >
      {/* header */}
      <div className="flex flex-col space-y-1.5 p-6 pb-3">
        {isEditing && (
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-2 mb-2">
            <div className="flex items-center gap-2 text-blue-800">
              <Edit3 className="h-4 w-4" />
              <span className="text-sm font-medium">Edit Mode - Make your changes and click Save</span>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between gap-4">
          {/* badges */}
          <div className="flex items-center gap-6 flex-1 min-w-0 justify-between max-w-[60%]">
              <div className="min-w-0 max-w-xs">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedOrder.customerName}
                    onChange={(e) => setEditedOrder({...editedOrder, customerName: e.target.value})}
                    className="font-bold text-lg text-gray-900 leading-tight bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <h3 className="font-bold text-lg text-gray-900 leading-tight">{order.customerName}</h3>
                )}
                <div className="flex items-center gap-1">
                  <p className="text-sm text-gray-600 truncate">#{order._id}</p>
                  <div className="group relative">
                    <Copy 
                      className="h-3.5 w-3.5 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors" 
                      onClick={(e) => {
                        e.stopPropagation(); 
                        navigator.clipboard.writeText(order._id)
                          .then(() => {
                            setCopyFeedback(true);
                            setTimeout(() => {
                              setCopyFeedback(false);
                            }, 2000);
                          })
                          .catch(err => console.error('Failed to copy: ', err));
                      }}
                    />
                    {/* tooltip when hovering*/}
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {copyFeedback ? "Copied!" : "Copy ID"}
                    </span>
                  </div>
                </div>
              </div>

            <div className="flex flex-wrap gap-2">
              {isEditing ? (
                <select
                  value={editedOrder.orderStatus}
                  onChange={(e) =>
                    setEditedOrder({ ...editedOrder, orderStatus: e.target.value })
                  }
                  className={`text-xs font-medium rounded px-2.5 py-0.5 border border-blue-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${getStatusColor(editedOrder.orderStatus)}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="Being Prepared">Being Prepared</option>
                  <option value="Picked Up">Picked Up</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Deferred">Deferred</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              ) : (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.orderStatus)}`}
                >
                  {order.orderStatus}
                </span>
              )}
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.assignmentStatus)}`}>
                {order.assignmentStatus}
              </span>
            </div>
            
          </div>

          {/* amt n stuff */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              {isEditing ? (
                <div className="flex flex-col gap-1 items-end">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editedOrder.paymentAmt ?? ''}
                    onChange={(e) =>
                      setEditedOrder({
                        ...editedOrder,
                        paymentAmt: parseFloat(e.target.value) || 0,
                      })
                    }
                    placeholder="Enter amount due"
                    className="w-full text-right text-xl font-bold text-green-600 leading-tight bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <select
                    value={editedOrder.paymentMethod ?? ''}
                    onChange={(e) =>
                      setEditedOrder({
                        ...editedOrder,
                        paymentMethod: e.target.value,
                      })
                    }
                    className={`w-full text-right text-xs font-medium leading-tight bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 
                      ${editedOrder.paymentMethod ? 'text-green-600' : 'text-gray-400'}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="" disabled hidden>
                      Select payment method
                    </option>
                    <option value="Cash">Cash</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              ) : (
                <>
                  <p className="text-xl font-bold text-green-600 leading-tight">
                    {formatCurrency(order.paymentAmt)}
                  </p>
                  <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                </>
              )}
            </div>

            <div className="text-right">
              <p className="text-sm font-medium text-gray-700 leading-tight">{formatDate(order.dateMade)}</p>
              <p className="text-xs text-gray-500">Order Date</p>
            </div>
            <div
              className="flex items-center justify-center w-6 h-6 cursor-pointer hover:text-blue-500 transition-colors"
              onClick={toggleExpanded}
            >
              {isExpanded ? (
                <ChevronUp className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-6 pt-0">
          <div className="h-[1px] w-full bg-gray-200 my-4"></div>
          
          <div className="space-y-6">

            {/* contact info & timeline grid*/}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              { /* contact info */}
              <div>
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                  <Phone className="h-4 w-4" />
                  <span>Contact</span>
                </div>
                <div className="ml-6 space-y-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedOrder.contactNumber}
                      onChange={(e) => setEditedOrder({...editedOrder, contactNumber: e.target.value})}
                      className="text-sm text-gray-700 bg-white border border-blue-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contact number"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <p className="text-sm text-gray-700">{order.contactNumber || "No contact number"}</p>
                  )}
                </div>
              </div>
              
              {/* timeline */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>Timeline</span>
                </div>
                <div className="ml-6 space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Date Made:</span>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editedOrder.dateMade}
                        required
                        onChange={(e) => {
                          if (e.target.value) {
                            setEditedOrder({ ...editedOrder, dateMade: e.target.value });
                          }
                        }}
                        className="text-gray-700 bg-white border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />

                    ) : (
                      <span className="text-gray-700 text-right">{formatDate(order.dateMade)}</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Delivered:</span>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editedOrder.dateDelivered ? new Date(editedOrder.dateDelivered).toISOString().split('T')[0] : ''}
                        onChange={(e) => setEditedOrder({...editedOrder, dateDelivered: e.target.value})}
                        className="text-gray-500 text-right bg-white border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-gray-500 text-right">{formatDate(order.dateDelivered)}</span>
                    )}
                  </div>
                </div>
              </div>

            </div>
            
            {/* assignment and payment grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* assignment details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                  <Truck className="h-4 w-4" />
                  <span>Assignment</span>
                </div>
                <div className="ml-6 space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Driver Assigned:</span>
                    <span className="text-gray-500 text-right">
                      {order.driver?.firstName && order.driver?.lastName
                        ? `${order.driver.firstName} ${order.driver.lastName}`
                        : "Not assigned"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Delivery Received By:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedOrder.deliveryReceivedBy}
                        onChange={(e) => setEditedOrder({...editedOrder, deliveryReceivedBy: e.target.value})}
                        className="text-gray-500 text-right bg-white border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[150px]"
                        placeholder="Delivery receiver"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-gray-500 text-right">{order.deliveryReceivedBy || "Not delivered"}</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* payment details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                  <DollarSign className="h-4 w-4" />
                  <span>Payment Details</span>
                </div>
                <div className="ml-6 space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Invoice:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedOrder.invoice}
                        onChange={(e) => setEditedOrder({...editedOrder, invoice: e.target.value})}
                        className="text-gray-500 text-right bg-white border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[150px]"
                        placeholder="Invoice number"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-gray-500 text-right">{order.invoice || "Not generated"}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Received:</span>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editedOrder.paymentReceived}
                        onChange={(e) =>
                          setEditedOrder({ ...editedOrder, paymentReceived: e.target.value })
                        }
                        className="text-gray-500 text-right bg-white border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[150px]"
                        placeholder="Payment amount"
                        style={{ textAlign: 'right' }} 
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-gray-500 text-right">{formatCurrency(order.paymentReceived) || "Pending"}</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Received By:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedOrder.paymentReceivedBy}
                        onChange={(e) => setEditedOrder({...editedOrder, paymentReceivedBy: e.target.value})}
                        className="text-gray-500 text-right bg-white border border-blue-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[150px]"
                        placeholder="Payment receiver"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="text-gray-500 text-right">{order.paymentReceivedBy || "N/A"}</span>
                    )}
                  </div>
                </div>
              </div>

            </div>
            
            {/* notes section */}
            {(order.salesmanNotes || order.driverNotes || order.secretaryNotes || isEditing) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                  <FileText className="h-4 w-4" />
                  <span>Notes</span>
                </div>
                <div className="ml-6 space-y-2">
                  {(order.salesmanNotes || isEditing) && (
                    <div className="bg-blue-50 p-2 rounded border border-blue-200">
                      <span className="font-medium text-blue-900 text-xs">Salesman:</span>
                      {isEditing ? (
                        <textarea
                          value={editedOrder.salesmanNotes}
                          onChange={(e) => setEditedOrder({...editedOrder, salesmanNotes: e.target.value})}
                          className="w-full text-blue-800 text-sm mt-1 bg-white border border-blue-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder="Salesman notes..."
                          rows={2}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <p className="text-blue-800 text-sm mt-1">{order.salesmanNotes}</p>
                      )}
                    </div>
                  )}
                  
                  {(order.driverNotes || isEditing) && (
                    <div className="bg-green-50 p-2 rounded border border-green-200">
                      <span className="font-medium text-green-900 text-xs">Driver:</span>
                      {isEditing ? (
                        <textarea
                          value={editedOrder.driverNotes}
                          onChange={(e) => setEditedOrder({...editedOrder, driverNotes: e.target.value})}
                          className="w-full text-green-800 text-sm mt-1 bg-white border border-green-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                          placeholder="Driver notes..."
                          rows={2}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <p className="text-green-800 text-sm mt-1">{order.driverNotes}</p>
                      )}
                    </div>
                  )}
                  
                  {(order.secretaryNotes || isEditing) && (
                    <div className="bg-purple-50 p-2 rounded border border-purple-200">
                      <span className="font-medium text-purple-900 text-xs">Secretary:</span>
                      {isEditing ? (
                        <textarea
                          value={editedOrder.secretaryNotes}
                          onChange={(e) => setEditedOrder({...editedOrder, secretaryNotes: e.target.value})}
                          className="w-full text-purple-800 text-sm mt-1 bg-white border border-purple-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                          placeholder="Secretary notes..."
                          rows={2}
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <p className="text-purple-800 text-sm mt-1">{order.secretaryNotes}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* salesman id */}
            <div className="bg-gray-50 p-3 rounded text-xs">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="text-gray-600">Salesman:</span>
                  <span className="text-gray-700">
                    {order.salesman?.firstName && order.salesman?.lastName
                      ? `${order.salesman.firstName} ${order.salesman.lastName}`
                      : order.salesmanID || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-lg border border-gray-200">

              {isEditing ? (
                // Save/Cancel buttons when editing
                <div className="flex gap-3 justify-center">
                  <button 
                    className="group relative bg-green-500 text-white font-medium px-6 py-3 rounded-lg hover:bg-green-600 hover:shadow-md transition-all duration-200 text-sm flex items-center justify-center gap-2"
                    onClick={handleSaveChanges}
                  >
                    <Check className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                  
                  <button 
                    className="group relative bg-gray-500 text-white font-medium px-6 py-3 rounded-lg hover:bg-gray-600 hover:shadow-md transition-all duration-200 text-sm flex items-center justify-center gap-2"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              ) : (
                // Regular action buttons
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button 
                    className="group relative bg-white text-gray-700 font-medium px-4 py-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md hover:bg-blue-50 transition-all duration-200 text-sm flex items-center justify-center gap-2 overflow-hidden"
                    onClick={handleEditToggle}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                    <Edit3 className="h-4 w-4 text-blue-600" />
                    <span>Edit Details</span>
                  </button>
                  
                  <button 
                    className="group relative bg-white text-gray-700 font-medium px-4 py-3 rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md hover:bg-green-50 transition-all duration-200 text-sm flex items-center justify-center gap-2 overflow-hidden"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowNoteModal(true);
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                    <FileText className="h-4 w-4 text-green-600" />
                    <span>Add Note</span>
                  </button>
                  
                  <button 
                    className="group relative bg-white text-gray-700 font-medium px-4 py-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md hover:bg-purple-50 transition-all duration-200 text-sm flex items-center justify-center gap-2 overflow-hidden"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowInvoiceModal(true);
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                    <DollarSign className="h-4 w-4 text-purple-600" />
                    <span>Add Invoice</span>
                  </button>
                  
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowAssignModal(true);
                    }}
                    className="group relative bg-white text-gray-700 font-medium px-4 py-3 rounded-lg border border-gray-200 hover:border-orange-300 hover:shadow-md hover:bg-orange-50 transition-all duration-200 text-sm flex items-center justify-center gap-2 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                    <Truck className="h-4 w-4 text-orange-600" />
                    <span>Assign Driver</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50" onClick={() => setShowNoteModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-gray-900">Add Secretary Note</h3>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note for Order #{order._id?.slice(-6)}
              </label>
              <textarea
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Enter your note here..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none text-black"
                rows={4}
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowNoteModal(false);
                  setNoteInput('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddNote}
                disabled={!noteInput.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50" onClick={() => setShowInvoiceModal(false)}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <DollarSign className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-900">Add Invoice</h3>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Invoice Number for Order #{order._id?.slice(-6)}
              </label>
              <input
                type="text"
                value={invoiceInput}
                onChange={(e) => setInvoiceInput(e.target.value)}
                placeholder="Enter invoice number..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-black"
                autoFocus
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  setInvoiceInput('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddInvoice}
                disabled={!invoiceInput.trim()}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && (
        <AssignDriverModal
          order={order}
          onClose={() => setShowAssignModal(false)}
          onAssign={async (driverId) => {
            toast.promise(
              (async () => {
                const res = await fetch("/api/orders", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    orderId: order._id,
                    driverAssignedID: driverId,
                    assignmentStatus: "Driver Assigned",
                  }),
                });

                if (!res.ok) {
                  const err = await res.json();
                  throw new Error(err.error || "Failed to assign driver.");
                }

                return res.json();
              })(),
              {
                loading: "Assigning driver...",
                success: "Driver assigned successfully!",
                error: (err) => err.message || "Assignment failed.",
              }
            ).then(() => {
              setShowAssignModal(false);
              if (typeof onRefresh === "function") {
                onRefresh();
              }
            });
          }}

        />
      )}

    </div>
  )
}