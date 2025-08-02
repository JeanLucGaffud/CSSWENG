'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Package, PlusCircle, LogOut } from "lucide-react";
import SignOutButton from "@/components/signout_button";
import CompactOrderCard from "@/components/order_card";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/orders?salesmanID=${session.user.id}`);
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setIsLoading(false);
      }
    };

    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        status === "authenticated" &&
        session?.user?.id
      ) {
        fetchOrders();
      }
    };

    if (
      status === "authenticated" &&
      session?.user?.id &&
      document.visibilityState === "visible" &&
      !hasFetchedRef.current
    ) {
      hasFetchedRef.current = true;
      fetchOrders();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status, session]);

  // 🔹 Filter out completed/cancelled orders
  const incompleteOrders = orders.filter(order => {
    const isDeliveredAndPaid =
      order.orderStatus === 'Delivered' &&
      Number(order.paymentAmt) === Number(order.paymentReceived);
    const isCancelled = order.orderStatus === 'Cancelled';
    return !(isDeliveredAndPaid || isCancelled);
  });

  return (
    <div className="flex h-screen bg-[url('/background.jpg')] bg-cover bg-center text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-50 bg-opacity-0 p-6">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Company Logo" className="ml-15 w-40 h-auto" />
        </div>
        <div className="ml-2 flex-col w-50 p-3 space-y-3">
          <button
            onClick={() => router.push('/salesman/createOrder')}
            className={`flex items-center gap-2 w-40 px-6 py-3 rounded border font-semibold transition duration-200 ${
              pathname === '/salesman/createOrder'
                ? 'bg-blue-900 text-white hover:bg-blue-950'
                : 'bg-blue-100 text-blue-950 hover:text-white hover:bg-blue-950'
            }`}
          >
            <PlusCircle className="w-5 h-5" /> Create Order
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-15 overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-black">Orders</h2>
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

        {/* Orders list */}
        <div className="flex flex-col space-y-4 pb-6 pr-30">
          {isLoading ? (
            <div className="text-center text-black text-lg py-10 animate-pulse">
              Loading orders...
            </div>
          ) : incompleteOrders.length > 0 ? (
            incompleteOrders.map((order) => (
              <CompactOrderCard key={order._id} order={order} />
            ))
          ) : (
            <div className="text-center text-black text-lg py-10">
              No orders found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
