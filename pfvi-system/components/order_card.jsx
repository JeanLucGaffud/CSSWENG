"use client"

import { useState } from "react"
import {
  Calendar, Phone, DollarSign, Truck, FileText,
  ChevronDown, ChevronUp, Copy
} from "lucide-react"

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

export default function CompactOrderCard({ order = {}, role = "default", onStatusUpdate }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState(false)
  const [currentStatus, setCurrentStatus] = useState(order.orderStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const [driverNoteInput, setDriverNoteInput] = useState(order.driverNotes || "")
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)

  const STATUS_SEQUENCE = ["Being Prepared", "Picked Up", "In Transit", "Delivered", "Deferred"]

  const toggleExpanded = () => setIsExpanded(!isExpanded)

  const handleStatusChange = async (newStatus) => {
  const confirmUpdate = confirm(`Change status to "${newStatus}"?`);
  if (!confirmUpdate) return;

  setIsUpdating(true);
  try {
    if (onStatusUpdate) {
      await onStatusUpdate(order._id, newStatus);
    } else {
      const res = await fetch('/api/updateOrderStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          orderId: order._id, 
          newStatus 
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update status');
      }
      
      const data = await res.json();
      setCurrentStatus(data.updatedOrder.orderStatus);
    }

    alert("Status updated successfully");
  } catch (err) {
    console.error('Update error:', err);
    alert(err.message || "Update failed. Please try again.");
  } finally {
    setIsUpdating(false);
  }
};

  const handleSubmitNote = async (e) => {
    e.stopPropagation()
    setIsSubmittingNote(true)
    try {
      // You can place here the backend integration for the driver's note
      alert("Note submitted (stub). Backend integration pending.")
    } catch (err) {
      console.error(err)
      alert("Failed to submit driver note.")
    } finally {
      setIsSubmittingNote(false)
      setShowNoteInput(false)
    }
  }

  return (
    <div 
      className="w-full max-w-6xl mx-auto cursor-pointer hover:shadow-md transition-all duration-200 border-2 hover:border-blue-200 rounded-lg bg-white shadow-sm mb-4"
      onClick={toggleExpanded}
    >
      {/* Header */}
      <div className="flex flex-col space-y-1.5 p-6 pb-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 flex-1 min-w-0">
            <div className="min-w-0">
              <h3 className="font-bold text-lg text-gray-900 leading-tight">{order.customerName}</h3>
              <div className="flex items-center gap-1">
                <p className="text-sm text-gray-600 truncate">#{order._id}</p>
                <div className="group relative">
                  <Copy
                    className="h-3.5 w-3.5 text-gray-400 cursor-pointer hover:text-blue-500"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigator.clipboard.writeText(order._id)
                        .then(() => {
                          setCopyFeedback(true)
                          setTimeout(() => setCopyFeedback(false), 2000)
                        })
                        .catch(err => console.error('Failed to copy: ', err))
                    }}
                  />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {copyFeedback ? "Copied!" : "Copy ID"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(currentStatus)}`}>
                {currentStatus}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-xl font-bold text-green-600 leading-tight">{formatCurrency(order.paymentAmt)}</p>
              <p className="text-xs text-gray-500">{order.paymentMethod}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{formatDate(order.dateMade)}</p>
              <p className="text-xs text-gray-500">Order Date</p>
            </div>
            <div className="w-6 h-6">
              {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 pt-0">
          <div className="h-[1px] w-full bg-gray-200 my-4" />

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact */}
              <div>
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                  <Phone className="h-4 w-4" />
                  <span>Contact</span>
                </div>
                <div className="ml-6 space-y-2 text-sm text-gray-700">
                  <p>{order.contactNumber || "No contact number"}</p>
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
                    <span className="text-gray-600">Date Made:</span>
                    <span className="text-gray-700">{formatDate(order.dateMade)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivered:</span>
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
                  <span>Assignment</span>
                </div>
                <div className="ml-6 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Driver ID:</span>
                    <span className="text-gray-500">{order.driverAssignedID || "Not assigned"}</span>
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
                    <span className="text-gray-500">{order.invoice || "Not generated"}</span>
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
                  <span className="text-gray-600">Salesman ID:</span>
                  <span className="font-mono text-gray-700">{order.salesmanID}</span>
                </div>
              </div>
            </div>

            {/* Update Status */}
            {role === "driver" && (
              <div className="pt-4 space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-800 mb-2">Update Order Status:</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUS_SEQUENCE.map((status) => {
                      const currentIndex = STATUS_SEQUENCE.indexOf(currentStatus)
                      const buttonIndex = STATUS_SEQUENCE.indexOf(status)
                      const isPastOrCurrent = buttonIndex <= currentIndex
                      return (
                        <button
                          key={status}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStatusChange(status)
                          }}
                          disabled={isPastOrCurrent || isUpdating}
                          className={`px-3 py-1 rounded text-white text-sm transition duration-200 ${
                            isPastOrCurrent
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-blue-700 hover:bg-blue-600'
                          }`}
                        >{status}</button>
                      )
                    })}
                  </div>
                </div>

                <div className="h-[1px] w-full bg-gray-300 my-4"></div>

                {/* Add Note*/}
                <div className="pt-2">
                  {!showNoteInput ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowNoteInput(true)
                      }}
                      className="bg-red-600 hover:bg-red-500 text-white text-sm px-3 py-1 rounded"
                    > {order.driverNotes ? "Edit Driver's Note" : "Add Driver's Note"} </button>
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
                          onClick={handleSubmitNote}
                          disabled={isSubmittingNote}
                          className="bg-green-600 hover:bg-green-500 text-white text-sm px-3 py-1 rounded"
                        > {isSubmittingNote ? "Saving..." : "Save Note"} </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowNoteInput(false)
                            setDriverNoteInput(order.driverNotes || "")
                          }}
                          className="bg-gray-300 text-sm px-3 py-1 rounded"
                        > Cancel </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
