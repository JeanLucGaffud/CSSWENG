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
    <div className="min-h-screen bg-[url('/background.jpg')] bg-cover bg-center flex flex-col md:flex-row text-white">
      {/* Header/Sidebar (stacks on top on mobile) */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-opacity-0 px-4 py-6 flex flex-col items-center justify-center">
        <div className="flex justify-center mb-6 w-full">
          <img src="/logo.png" alt="Company Logo" className="w-32 md:w-40 h-auto mx-auto" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-2 sm:px-6 py-6 overflow-y-auto bg-white bg-opacity-80 rounded-t-3xl md:rounded-none text-black flex flex-col">
        {/* Heading + Welcome + Sign Out */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold">My Orders</h2>
            <p className="text-lg font-semibold">
              {session?.user?.name ? `Welcome back, ${session.user.name}!` : ''}
            </p>
          </div>
          <SignOutButton
            className="flex items-center gap-2 bg-blue-100 text-blue-950 font-semibold px-6 py-3 rounded border hover:text-white hover:bg-blue-950 transition duration-200 w-full sm:w-auto justify-center"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </SignOutButton>
        </div>

        {/* Orders List */}
        <div className="flex flex-col space-y-4 pb-6">
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
