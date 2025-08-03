"use client"

import { useState } from "react"
import {
  Calendar, Phone, DollarSign, Truck, FileText,
  ChevronDown, ChevronUp, Copy
} from "lucide-react"
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';

function getStatusColor(status) {
  if (!status) return "bg-gray-100 text-gray-800 border-gray-200"
  status = status.toLowerCase()
  if (status.includes("cancel")) return "bg-red-100 text-red-800 border-red-200"
  if (status.includes("delivered") || status.includes("complete")) return "bg-green-100 text-green-800 border-green-200"
  if (status.includes("transit") || status.includes("picked up")) return "bg-blue-100 text-blue-800 border-blue-200"
  if (status.includes("being prepared") || status.includes("preparing")) return "bg-yellow-100 text-yellow-800 border-yellow-200"
  if (status.includes("deferred")) return "bg-purple-100 text-purple-800 border-purple-200"
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

export default function CompactDriverOrderCard({ order = {}, role = "default", onStatusUpdate, onNoteUpdate }) {
  const { data: session, status } = useSession()
  const [isExpanded, setIsExpanded] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(order.orderStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const [driverNoteInput, setDriverNoteInput] = useState(order.driverNotes || "")
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)
  const [pendingStatus, setPendingStatus] = useState(null)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [pendingNote, setPendingNote] = useState("")
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [deliveryReceiver, setDeliveryReceiver] = useState("");
  const [isPaidOnDelivery, setIsPaidOnDelivery] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [showDeliveryConfirmModal, setShowDeliveryConfirmModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState(true);
  const [deliveryError, setDeliveryError] = useState("");


  const STATUS_SEQUENCE = ["Being Prepared", "Picked Up", "In Transit", "Delivered", "Deferred"]

  const handleCardClick = () => {
    if (!isExpanded) setIsExpanded(true)
  }

  const toggleExpanded = (e) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const handleStopPropagation = (e) => e.stopPropagation()

  const handleStatusChange = (newStatus) => {
    if (newStatus === "Delivered") {
      setShowDeliveryModal(true);
    } else {
      setPendingStatus(newStatus);
      setShowStatusModal(true);
    }
  }

  const confirmStatusChange = async () => {
    setIsUpdating(true)
    try {
      if (onStatusUpdate) {
        await onStatusUpdate(order._id, pendingStatus)
        setCurrentStatus(pendingStatus)
        showModalFeedback(true, `Status changed to "${pendingStatus}" successfully.`);
      }
    } catch (err) {
      console.error('Update error:', err)
      showModalFeedback(false, "Failed to change status.");
    } finally {
      setIsUpdating(false)
      setShowStatusModal(false)
      setPendingStatus(null)
    }
  }

  const cancelStatusChange = () => {
    setShowStatusModal(false)
    setPendingStatus(null)
  }

  const handleSubmitNote = async () => {
    try {
      setIsSubmittingNote(true)
      setDriverNoteInput(pendingNote)

      const res = await fetch('api/updateOrderDriverNotes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order._id,
          driverNotes: pendingNote,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update driver note.');
      }

      if (onNoteUpdate) onNoteUpdate(order._id, pendingNote)

      setShowNoteInput(false)
      setShowNoteModal(false)
      showModalFeedback(true, "Driver note saved successfully.");
    } catch (err) {
      console.error(err)
      showModalFeedback(false, "Failed to save driver note.");
    } finally {
      setIsSubmittingNote(false)
    }
  }

  const submitDeliveryInfo = async () => {
    setShowDeliveryConfirmModal(false);
    setIsUpdating(true);

    try {
      const payload = {
        orderId: order._id,
        newStatus: "Delivered",
        deliveryDate,
        deliveryReceivedBy: deliveryReceiver,
        paymentReceived: isPaidOnDelivery === "yes" ? parseFloat(paymentAmount) : null,
        paymentReceivedBy: isPaidOnDelivery === "yes" ? "Driver" : null,
      };

      if (onStatusUpdate) {
        await onStatusUpdate(order._id, payload);
        setCurrentStatus("Delivered");
      }
      showModalFeedback(true, "Order marked as delivered successfully.");
    } catch (err) {
      showModalFeedback(false, "Failed to mark as delivered.");
    } finally {
      setIsUpdating(false);
      setShowDeliveryModal(false);
      setDeliveryReceiver("");
      setPaymentAmount("");
      setIsPaidOnDelivery(null);
    }
  };

  const showModalFeedback = (success, message) => {
    setFeedbackSuccess(success);
    setFeedbackMessage(message);
    setShowFeedbackModal(true);
  };

  return (
    <div 
      className="w-full max-w-6xl mx-auto cursor-pointer hover:shadow-md transition-all duration-200 border-2 hover:border-blue-200 rounded-lg bg-white shadow-sm mb-4"
      onClick={toggleExpanded}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-3 relative">
        {/* Chevron */}
        <div
          className="absolute top-4 right-4 text-gray-400 hover:text-blue-500 cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(prev => !prev)
          }}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>

        {/* Date section */}
        <div className="flex flex-col items-center justify-center w-10 mr-4">
          <p className="text-sm text-gray-500 uppercase">{format(order.dateMade, 'MMM')}</p>
          <p className="text-2xl font-bold text-gray-900 leading-none">{format(order.dateMade, 'd')}</p>
          <p className="text-xs text-gray-500">{format(order.dateMade, 'EEE')}</p>
        </div>

        {/* Main Info section */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-900 leading-tight">{order.customerName}</h3>
          <p className="text-sm font-medium text-gray-700">Order #{order.orderNumber}</p>

          {/* Order ID with Copy */}
          <div className="flex items-center gap-1 mt-0.5">
            <p className="text-sm text-gray-600 truncate">Order ID: {order._id}</p>
            <div className="group relative">
              <Copy
                className="h-3.5 w-3.5 text-gray-400 cursor-pointer hover:text-blue-500"
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(order._id)
                    .then(() => {
                      setCopyFeedback(true);
                      setTimeout(() => setCopyFeedback(false), 2000);
                    })
                    .catch(err => console.error('Failed to copy: ', err));
                }}
              />
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {copyFeedback ? "Copied!" : "Copy ID"}
              </span>
            </div>
          </div>

          {/* Price and Payment Method */}
          <div className="flex items-center gap-5 mt-0.5">
            <p className="text-lg font-semibold text-green-600 whitespace-nowrap">
              {formatCurrency(order.paymentAmt)}
            </p>
            <p className="text-base text-white whitespace-nowrap rounded-full px-3 py-0.5 bg-blue-600">
              {order.paymentMethod}
            </p>
          </div>
        </div>

        {/* Status */}
        <div className="m-4">
          <span className={`inline-flex justify-center items-center rounded-full px-3 py-1 text-lg font-medium ${getStatusColor(currentStatus)}`}>
            {currentStatus}
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 pt-0" onClick={handleStopPropagation}>
          <div className="h-[1px] w-full bg-gray-200 my-4" />

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact */}
              <div>
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                  <Phone className="h-4 w-4" />
                  <span>Contact Details of Customer</span>
                </div>
                <div className="ml-6 space-y-2 text-sm text-gray-700">
                  <p>{order.contactNumber || "No contact number"}</p>
                  <div className="group relative">
                  <Copy
                    className="h-3.5 w-3.5 text-gray-400 cursor-pointer hover:text-blue-500"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigator.clipboard.writeText(order.contactNumber)
                        .then(() => {
                          setCopyFeedback(true)
                          setTimeout(() => setCopyFeedback(false), 2000)
                        })
                        .catch(err => console.error('Failed to copy: ', err))
                    }}
                  />
                  <span className="bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {copyFeedback ? "Copied!" : "Copy Contact Details"}
                  </span>
                </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>Timeline</span>
                </div>
                <div className="ml-6 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Date:</span>
                    <span className="text-gray-700">{formatDate(order.dateMade)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivered Date:</span>
                    <span className="text-gray-500">{formatDate(order.dateDelivered)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignment & Payment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                  <Truck className="h-4 w-4" />
                  <span>Delivery Information</span>
                </div>
                <div className="ml-6 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Driver Name:</span>
                    <span className="text-gray-500">{session?.user?.name ? `${session.user.name}` : "Not assigned"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Received By:</span>
                    <span className="text-gray-500">{order.deliveryReceivedBy || "Not delivered"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                  <DollarSign className="h-4 w-4" />
                  <span>Payment Details</span>
                </div>
                <div className="ml-6 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice:</span>
                    <span className="text-gray-500">{order.invoice || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Received:</span>
                    <span className="text-gray-500">{formatCurrency(order.paymentReceived) || "Pending"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Received By:</span>
                    <span className="text-gray-500">{order.paymentReceivedBy || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {(order.salesmanNotes || order.driverNotes || order.secretaryNotes) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                  <FileText className="h-4 w-4" />
                  <span>Notes</span>
                </div>
                <div className="ml-6 space-y-2">
                  {order.salesmanNotes && (
                    <div className="bg-blue-50 p-2 rounded border border-blue-200">
                      <span className="font-medium text-blue-900 text-xs">Salesman:</span>
                      <p className="text-blue-800 text-sm mt-1">{order.salesmanNotes}</p>
                    </div>
                  )}
                  {order.driverNotes && (
                    <div className="bg-green-50 p-2 rounded border border-green-200">
                      <span className="font-medium text-green-900 text-xs">Driver:</span>
                      <p className="text-green-800 text-sm mt-1">{order.driverNotes}</p>
                    </div>
                  )}
                  {order.secretaryNotes && (
                    <div className="bg-purple-50 p-2 rounded border border-purple-200">
                      <span className="font-medium text-purple-900 text-xs">Secretary:</span>
                      <p className="text-purple-800 text-sm mt-1">{order.secretaryNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Salesman ID */}
            <div className="bg-gray-50 p-3 rounded text-xs">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <span className="text-gray-600">Salesman Name:</span>
                  <span className="text-gray-700">
                    {order.salesmanID?.firstName && order.salesmanID?.lastName 
                      ? `${order.salesmanID.firstName} ${order.salesmanID.lastName}` 
                      : "Not available"}
                  </span>
                </div>
              </div>
            </div>

            {/* last modified & updatedAt */}
            <div className="bg-gray-50 p-3 rounded text-xs mt-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                <div className="text-gray-600">
                  Last Modified By: <span className="text-gray-800">{order.lastModified || "N/A"}</span>
                </div>
                <div className="text-gray-600 mt-1 sm:mt-0">
                  Last Updated At:{" "}
                  <span className="text-gray-800">
                    {order.updatedAt ? new Date(order.updatedAt).toLocaleString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    }) : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Update Status */}
            {role === "driver" && (
              <div className="pt-4 space-y-4">
                <div>
                  <p className="text-sxs font-semibold text-gray-800 mb-2">Update Order Status:</p>
                  <div className="flex justify-center">
                    <div className="flex flex-wrap justify-center gap-2">
                      {STATUS_SEQUENCE.map((status) => {
                        return (
                          <button
                            key={status}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStatusChange(status)
                            }}
                            className={`text-white font-medium rounded-lg text-sm px-4 py-2 text-center bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800`}
                          >{status}</button>)
                      })}
                    </div>
                  </div>
                </div>

                <div className="h-[1px] w-full bg-gray-300 my-4"></div>

                {/* Add/Edit Note */}
                <div className="pt-2">
                  {!showNoteInput ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowNoteInput(true)
                        setDriverNoteInput(order.driverNotes || "")
                      }}
                      className="text-white bg-gradient-to-r from-purple-500 via-purple-600 to-purple-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-purple-300 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
                    >{order.driverNotes ? "Edit Driver's Note" : "Add Driver's Note"}</button>
                  ) : (
                    <div className="space-y-2 mt-2">
                      <textarea
                        className="w-full border border-gray-300 rounded p-2 text-sm text-black"
                        rows={3}
                        placeholder="Enter driver note..."
                        value={driverNoteInput}
                        onChange={(e) => setDriverNoteInput(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setPendingNote(driverNoteInput)
                            setShowNoteModal(true)
                          }}
                          disabled={isSubmittingNote}
                          className="text-white bg-gradient-to-r from-green-400 via-green-500 to-green-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-green-300 dark:focus:ring-green-800 font-medium rounded-lg text-sm px-4 py-2 text-center me-2 mb-2"
                        >
                          {isSubmittingNote ? "Saving..." : "Save Note"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowNoteInput(false)
                            setDriverNoteInput(order.driverNotes || "")
                          }}
                          className="text-white bg-gradient-to-r from-red-400 via-red-500 to-red-600 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm px-4 py-2 text-center me-2 mb-2"
                        >Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Change Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs">
            <p className="mb-4 text-gray-800">
              Change status to <span className="font-bold">{pendingStatus}</span>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={cancelStatusChange}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1 rounded"
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Note Save Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xs" onClick={(e) => e.stopPropagation()}>
            <p className="mb-4 text-gray-800">
              Save this note?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowNoteModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-1 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitNote}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1 rounded"
                disabled={isSubmittingNote}
              >
                {isSubmittingNote ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Info Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg text-blue-900" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Mark Order as Delivered</h3>

            <div className="space-y-4 text-sm">
              <div>
                <label className="font-medium">Date of Delivery:</label>
                <input
                  type="date"
                  className="w-full border mt-1 p-2 rounded"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="font-medium">Delivery Receiver Name:</label>
                <input
                  type="text"
                  className="w-full border mt-1 p-2 rounded"
                  value={deliveryReceiver}
                  onChange={(e) => setDeliveryReceiver(e.target.value)}
                  required
                />
              </div>
              <div>
                <p className="font-medium mb-1">Is this order paid upon delivery?</p>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paid"
                      value="yes"
                      checked={isPaidOnDelivery === "yes"}
                      onChange={() => setIsPaidOnDelivery("yes")}
                    />
                    Yes
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paid"
                      value="no"
                      checked={isPaidOnDelivery === "no"}
                      onChange={() => setIsPaidOnDelivery("no")}
                    />
                    No
                  </label>
                </div>
              </div>
              {isPaidOnDelivery === "yes" && (
                <div>
                  <label className="font-medium">Payment Amount:</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full border mt-1 p-2 rounded"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>

            {deliveryError && (
              <div className="text-red-600 text-sm font-medium mb-2">
                {deliveryError}
              </div>
            )}
            <div className="flex justify-end mt-6 space-x-4">
              <button
                onClick={() => {
                  if (!deliveryReceiver.trim()) {
                    setDeliveryError("Delivery receiver name is required.");
                    return;
                  }

                  if (isPaidOnDelivery !== "yes" && isPaidOnDelivery !== "no") {
                    setDeliveryError("Please select whether the order is paid on delivery.");
                    return;
                  }

                  if (isPaidOnDelivery === "yes" && (!paymentAmount || parseFloat(paymentAmount) <= 0)) {
                    setDeliveryError("Please enter a valid payment amount.");
                    return;
                  }

                  setDeliveryError("");
                  setShowDeliveryModal(false);
                  setShowDeliveryConfirmModal(true);
                }}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Confirm Modal */}
      {showDeliveryConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg text-blue-900" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Confirm Delivery</h3>
            <div className="mb-6 text-sm space-y-1">
              <p><strong>Receiver:</strong> {deliveryReceiver}</p>
              <p><strong>Date:</strong> {deliveryDate}</p>
              <p><strong>Paid on Delivery:</strong> {isPaidOnDelivery === 'yes' ? 'Yes' : 'No'}</p>
              {isPaidOnDelivery === 'yes' && (
                <p><strong>Amount:</strong> ₱{parseFloat(paymentAmount || 0).toFixed(2)}</p>
              )}
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeliveryConfirmModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={submitDeliveryInfo}
                className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full text-center" onClick={(e) => e.stopPropagation()}>
            <h3 className={`text-lg font-bold mb-2 ${feedbackSuccess ? "text-green-600" : "text-red-600"}`}>
              {feedbackSuccess ? "✅ Success" : "❌ Failed"}
            </h3>
            <p className="text-sm text-gray-700 mb-4">{feedbackMessage}</p>
            <button
              onClick={() => setShowFeedbackModal(false)}
              className="mt-2 px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
            >
              OK
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
