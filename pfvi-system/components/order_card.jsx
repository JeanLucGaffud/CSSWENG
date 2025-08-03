"use client";

import { useState } from "react";
import { Calendar, Phone, DollarSign, Truck, FileText, ChevronDown, ChevronUp, Copy } from "lucide-react";

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

function formatDate(dateString) {
  if (!dateString) return "Not set";
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

export default function CompactOrderCard({ order }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  const toggleExpanded = (e) => {
    e.stopPropagation();
    setIsExpanded((prev) => !prev);
  };

  const renderUserNameOrId = (value, placeholder = "N/A") => {
    if (!value) return placeholder;
    if (typeof value === "object") {
      const { firstName, lastName, _id } = value;
      if (firstName && lastName) return `${firstName} ${lastName}`;
      return _id || placeholder;
    }
    return value;
  };

  return (
    <div className="w-full max-w-6xl mx-auto cursor-pointer hover:shadow-md transition-all duration-200 border-2 hover:border-blue-200 rounded-lg bg-white shadow-sm mb-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 gap-4">
        {/* Left section */}
        <div className="flex flex-col flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-900 leading-tight break-words">
            {typeof order.customerName === "object"
              ? renderUserNameOrId(order.customerName, "No name")
              : order.customerName}
          </h3>
          <p className="text-sm font-medium text-gray-700">Order #{order.orderNumber}</p>
          <p className="text-xs text-gray-600 break-all">Order ID: {order._id}</p>
        </div>

        {/* Right section */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
          <div className="text-right">
            <p className="text-lg sm:text-xl font-bold text-green-600">{formatCurrency(order.paymentAmt)}</p>
            <p className="text-xs text-gray-500">{order.paymentMethod}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{formatDate(order.dateMade)}</p>
            <p className="text-xs text-gray-500">Order Date</p>
          </div>
          <div onClick={toggleExpanded} className="cursor-pointer">
            {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="p-4 pt-0">
          <div className="h-[1px] w-full bg-gray-200 my-4"></div>
          <div className="space-y-6">
            {/* Contact & Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                  <Phone className="h-4 w-4" />
                  <span>Contact Details</span>
                </div>
                <div className="ml-6 space-y-2">
                  <p className="text-sm text-gray-700 break-words">{order.contactNumber || "No contact number"}</p>
                </div>
              </div>
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
                    <span className="text-gray-600">Driver:</span>
                    <span className="text-gray-500">{renderUserNameOrId(order.driverAssignedID, "Not assigned")}</span>
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
                  <span>Payment</span>
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
          </div>
        </div>
      )}
    </div>
  );
}
