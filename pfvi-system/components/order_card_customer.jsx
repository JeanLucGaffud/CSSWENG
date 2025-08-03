"use client"

import { useState } from "react"
import { Calendar, Phone, DollarSign, Truck, FileText, ChevronDown, ChevronUp, Copy } from "lucide-react"
import { format } from 'date-fns';

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

function OrderStatusTracker({ orderStatus, order }) {
  const statusList = [
    "Being Prepared",
    "Picked Up", 
    "In Transit",
    "Delivered",
    "Deferred"
  ];

  const currentStatusIndex = statusList.findIndex(status => 
    orderStatus.toLowerCase().includes(status.toLowerCase())
  );

  return (
    <div className="w-full mx-auto mt-4 px-2">
      <h3 className="font-bold text-base sm:text-lg text-gray-900 leading-tight mb-4 text-center">
        Order Status Tracker
      </h3>

      <div className="block sm:hidden">
        {/* Mobile vertical tracker */}
        <div className="flex flex-col items-start space-y-4 relative pl-4">
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-gray-300"></div>
          {statusList.map((status, index) => {
            let circleColor = "bg-white border-gray-300";
            let textColor = "text-gray-500";

            if (index <= currentStatusIndex) {
              if (status === "Deferred") {
                circleColor = "bg-red-600 border-red-600";
                textColor = "text-red-600";
              } else if (status === "Delivered") {
                if (orderStatus.toLowerCase().includes("deferred")) {
                  circleColor = "bg-white border-gray-300";
                  textColor = "text-gray-500";
                } else {
                  circleColor = "bg-green-600 border-green-600";
                  textColor = "text-green-600";
                }
              } else {
                circleColor = "bg-green-600 border-green-600";
                textColor = "text-green-600";
              }
            }

            return (
              <div key={index} className="relative z-10 flex items-center">
                <div className={`w-4 h-4 rounded-full border-2 ${circleColor} -ml-2 mr-3`} />
                <div className="flex-1">
                  <span className={`text-sm ${textColor}`}>
                    {status}
                  </span>
                  {order.statusTimestamps?.[status] && (
                    <div className="text-xs text-gray-500 mt-1">
                      {format(new Date(order.statusTimestamps[status]), 'PPpp')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="hidden sm:flex items-center justify-center relative">
        <div className="absolute top-1/4 left-0 right-0 border-t-2 border-gray-300 z-0"></div>
        {statusList.map((status, index) => {
          let circleColor = "bg-white border-gray-300";
          let textColor = "text-gray-500";

          if (index <= currentStatusIndex) {
            if (status === "Deferred") {
              circleColor = "bg-red-600 border-red-600";
              textColor = "text-red-600";
            } else if (status === "Delivered") {
              if (orderStatus.toLowerCase().includes("deferred")) {
                circleColor = "bg-white border-gray-300";
                textColor = "text-gray-500";
              } else {
                circleColor = "bg-green-600 border-green-600";
                textColor = "text-green-600";
              }
            } else {
              circleColor = "bg-green-600 border-green-600";
              textColor = "text-green-600";
            }
          }

          return (
            <div key={index} className="relative z-10 flex items-center flex-col mx-2 lg:mx-4">
                <div className={`w-6 h-6 rounded-full border-4 ${circleColor}`} />
                <span className={`text-xs lg:text-sm ${textColor} text-center mt-2`}>
                  {status}
                  {order.statusTimestamps?.[status] && (
                    <span className="text-xs text-gray-500 block mt-1">
                      {format(new Date(order.statusTimestamps[status]), 'PPpp')}
                    </span>
                  )}
                </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CompactOrderCard({ order }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copyFeedback, setCopyFeedback] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <div 
      className="w-full mx-auto cursor-pointer hover:shadow-md transition-all duration-200 border-2 hover:border-blue-200 rounded-lg bg-white shadow-sm mb-4"
      onClick={toggleExpanded}
    >
      {/* Header */}
      <div className="flex flex-col space-y-3 p-4 sm:p-6 pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Customer info and status */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 flex-1 min-w-0">
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-lg text-gray-900 leading-tight truncate">{order.customerName}</h3>
              <div className="flex items-center gap-1 mt-1">
                <p className="text-sm text-gray-600 truncate">Order ID: {order._id}</p>
                <div className="group relative">
                  <Copy 
                    className="h-3.5 w-3.5 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors flex-shrink-0" 
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
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {copyFeedback ? "Copied!" : "Copy ID"}
                  </span>
                </div>
              </div>
            </div>

            {/* Status badge */}
            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                {order.orderStatus}
              </span>
            </div>
          </div>

          {/* Payment and date info */}
          <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
            <div className="text-left sm:text-right">
              <p className="text-lg sm:text-xl font-bold text-green-600 leading-tight">{formatCurrency(order.paymentAmt)}</p>
              <p className="text-xs text-gray-500">{order.paymentMethod}</p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm font-medium text-gray-700 leading-tight">{formatDate(order.dateMade)}</p>
              <p className="text-xs text-gray-500">Order Date</p>
            </div>
            <div className="flex items-center justify-center w-6 h-6 flex-shrink-0">
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
        <div className="p-4 sm:p-6 pt-0">
          <div className="h-[1px] w-full bg-gray-200 my-4"></div>
          
          <div className="space-y-6">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Contact info */}
              <div>
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>Contact Details</span>
                </div>
                <div className="ml-6 space-y-2">
                  <p className="text-sm text-gray-700 break-words">{order.contactNumber || "No contact number"}</p>
                </div>
              </div>
              
              {/* Timeline */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span>Timeline</span>
                </div>
                <div className="ml-6 space-y-2 text-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="text-gray-600">Date Made:</span>
                    <span className="text-gray-700">{formatDate(order.dateMade)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="text-gray-600">Delivered:</span>
                    <span className="text-gray-500">
                      {order.dateDelivered ? formatDate(order.dateDelivered) : "Not Delivered"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Assignment details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                  <Truck className="h-4 w-4 flex-shrink-0" />
                  <span>Assignment</span>
                </div>
                <div className="ml-6 space-y-2 text-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="text-gray-600">Driver ID:</span>
                    <span className="text-gray-500 break-words">{order.driverAssignedID || "Not assigned"}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="text-gray-600">Delivery Received By:</span>
                    <span className="text-gray-500 break-words">{order.deliveryReceivedBy || "Not delivered"}</span>
                  </div>
                </div>
              </div>
              
              {/* Payment details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                  <DollarSign className="h-4 w-4 flex-shrink-0" />
                  <span>Payment Details</span>
                </div>
                <div className="ml-6 space-y-2 text-sm">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="text-gray-600">Invoice:</span>
                    <span className="text-gray-500 break-words">{order.invoice || "Not set"}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="text-gray-600">Payment Received:</span>
                    <span className="text-gray-500">
                      {order.paymentReceived != null ? formatCurrency(order.paymentReceived) : "Not Received"}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                    <span className="text-gray-600">Payment Received By:</span>
                    <span className="text-gray-500 break-words">{order.paymentReceivedBy || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Salesman id */}
            <div className="bg-gray-50 p-3 rounded text-xs">
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <span className="text-gray-600">Salesman ID:</span>
                  <span className="font-mono text-gray-700 break-all">{order.salesmanID}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <OrderStatusTracker orderStatus={order.orderStatus} order={order}/>
    </div>
  )
}