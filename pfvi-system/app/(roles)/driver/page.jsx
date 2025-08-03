'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { LogOut } from "lucide-react"
import SignOutButton from "@/components/signout_button"
import CompactDriverOrderCard from "@/components/order_card_driver"

export default function DriverOrdersPage() {
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState([])
  const [filter, setFilter] = useState('All')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const hasFetchedRef = useRef(false)

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/fetchOrderDriver?driverID=${session.user.id}`)
        const data = await res.json()
        setOrders(data)
      } catch (err) {
        console.error("Failed to fetch orders:", err)
      } finally {
        setIsLoading(false)
      }
    }

    if (
      status === "authenticated" &&
      session &&
      document.visibilityState === "visible" &&
      !hasFetchedRef.current
    ) {
      hasFetchedRef.current = true
      fetchOrders()
    }
  }, [status, session])

  const updateStatus = async (orderId, newStatusPayload) => {
    try {
      const res = await fetch('/api/updateOrderStatus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          ...(typeof newStatusPayload === "string"
            ? { newStatus: newStatusPayload }
            : newStatusPayload)
        })
      })

      if (!res.ok) throw new Error('Status update failed')

      const data = await res.json()

      setOrders((prev) =>
        prev.map((order) =>
          order._id === orderId ? { ...order, ...data.updatedOrder } : order
        )
      )
    } catch (err) {
      console.error("Status update error:", err)
      alert("Failed to update order status.")
    }
  }

  const handleNoteUpdate = (orderId, newDriverNote) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order._id === orderId
          ? { ...order, driverNotes: newDriverNote }
          : order
      )
    )
  }

  // 🔹 Filter out completed/cancelled orders
  const incompleteOrders = orders.filter(order => {
    const isDeliveredAndPaid =
      order.orderStatus === 'Delivered' &&
      Number(order.paymentAmt) === Number(order.paymentReceived)
    const isCancelled = order.orderStatus === 'Cancelled'
    return !(isDeliveredAndPaid || isCancelled)
  })

  return (
    <div className="flex h-screen bg-[url('/background.jpg')] bg-cover bg-center text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-0 md:w-16 lg:w-50 p-2 md:p-4 lg:p-6">
        <div className="flex justify-center mb-4 md:mb-8">
          <img 
            src="/logo.png" 
            alt="Company Logo" 
            className="w-0 md:w-20 lg:w-40 h-auto" 
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-black">My Orders</h1>
            <p className="text-lg font-semibold text-black">
              {session?.user?.name ? `Welcome back, ${session.user.name}!` : ''}
            </p>
          </div>
          <SignOutButton
            className="flex items-center gap-2 bg-blue-100 text-blue-950 font-semibold px-6 py-3 rounded border hover:text-white hover:bg-blue-950 transition duration-200"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </SignOutButton>
        </div>

        {/* Orders */}
        <div className="flex flex-col space-y-4 pb-6 pr-30">
          {isLoading ? (
            <div className="text-center text-black text-lg py-10 animate-pulse">
              Loading orders...
            </div>
          ) : incompleteOrders.length > 0 ? (
            incompleteOrders
              .filter(order => filter === 'All' || order.orderStatus === filter)
              .map((order) => (
                <CompactDriverOrderCard
                  key={order._id}
                  order={order}
                  role="driver"
                  onStatusUpdate={updateStatus}
                  onNoteUpdate={handleNoteUpdate}
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
