'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import SignOutButton from "@/components/signout_button"
import CompactOrderCard from "@/components/order_card"

export default function DriverOrdersPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('All')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  //Replace the mockOrders here to fetch orders assigned to the driver
  useEffect(() => {
  if (status === "authenticated") {
    const mockOrders = [
      {
        _id: "665a43f23a1b3b6e6d7a1240",
        salesmanID: "664f71a98a8cbe36f0241f09",
        customerName: "Maraiah Queen Arceta",
        invoice: "INV-001",
        paymentAmt: 2750,
        paymentMethod: "Cash",
        dateMade: "2025-06-01T10:00:00Z",
        contactNumber: "09171234567",
        assignmentStatus: "Driver Assigned",
        driverAssignedID: "665a44a9d3d2a12f74be1e93",
        orderStatus: "Being Prepared",
        dateDelivered: null,
        deliveryReceivedBy: null,
        paymentReceived: null,
        paymentReceivedBy: null,
        salesmanNotes: null,
        driverNotes: null,
        secretaryNotes: "2pc Cheesy Yumburger"
      },
      {
        _id: "665a44053a1b3b6e6d7a1241",
        salesmanID: "664f71a98a8cbe36f0241f09",
        customerName: "Ma. Nicolette Vergara",
        invoice: "INV-002",
        paymentAmt: 4900,
        paymentMethod: "Cheque",
        dateMade: "2025-06-02T15:00:00Z",
        contactNumber: "09181234567",
        assignmentStatus: "Driver Assigned",
        driverAssignedID: "665a44a9d3d2a12f74be1e93",
        orderStatus: "Being Prepared",
        dateDelivered: null,
        deliveryReceivedBy: null,
        paymentReceived: null,
        paymentReceivedBy: null,
        salesmanNotes: "Verify recipient identity.",
        driverNotes: null,
        secretaryNotes: null
      }
    ];

    setOrders(mockOrders);
    setIsLoading(false);
  }
}, [status])


  const handleFilterClick = (filterOption) => {
    setFilter(filterOption)
    setIsDropdownOpen(false)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const updateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch('/api/updateorderstatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, newStatus }),
      })
      if (!res.ok) throw new Error('Update failed')

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, orderStatus: newStatus } : order
        )
      )
    } catch (err) {
      console.error('Failed to update status:', err)
      alert('Failed to update order status.')
    }
  }

  return (
    <div className="flex h-screen bg-[url('/background.jpg')] bg-cover bg-center text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-50 bg-opacity-0 p-6">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Company Logo" className="ml-15 w-40 h-auto" />
        </div>
        <div className="flex-col w-50 p-3">
          <SignOutButton className="w-40 bg-blue-100 text-blue-950 font-semibold block px-6 py-3 rounded border hover:text-white hover:bg-blue-950 transition duration-200 text-center" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-15 overflow-y-auto">
        <div className="mb-6 flex items-center space-x-3">
          <div className="relative">
            <button className="p-3 bg-blue-900 text-white rounded shadow-md" onClick={toggleDropdown}>
              Filter
            </button>
            {isDropdownOpen && (
              <div className="absolute left-0 bg-white text-black rounded shadow-lg mt-2 w-48">
                <ul>
                  {['All', 'Preparing', 'Picked Up', 'In Transit', 'Delivered', 'Deferred'].map((option) => (
                    <li
                      key={option}
                      className="cursor-pointer hover:bg-gray-200 p-2"
                      onClick={() => handleFilterClick(option)}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <input
            type="search"
            placeholder="Search..."
            className="w-3/4 p-3 rounded border border-black bg-white/10 text-black"
          />
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-black">My Orders</h2>
          <p className="text-lg font-semibold text-black">
            {session?.user?.name ? `Welcome back, ${session.user.name}!` : ''}
          </p>
        </div>

        <div className="flex flex-col space-y-4 pb-6 pr-30">
          {isLoading ? (
            <div className="text-center text-black text-lg py-10 animate-pulse">
              Loading orders...
            </div>
          ) : orders.length > 0 ? (
            orders
              .filter(order => filter === 'All' || order.orderStatus === filter)
              .map((order) => (
                <CompactOrderCard
                  key={order._id}
                  order={order}
                  role="driver"
                  onStatusUpdate={updateStatus}
                />
              ))
          ) : (
            <div className="text-center text-black text-lg py-10">
              No orders found.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
