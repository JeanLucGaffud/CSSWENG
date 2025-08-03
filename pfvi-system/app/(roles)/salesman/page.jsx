'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { PlusCircle, LogOut } from "lucide-react";
import SignOutButton from "@/components/signout_button";
import CompactOrderCard from "@/components/order_card";

export default function Home() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.user?.id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/orders?salesmanID=${session.user.id}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || "Failed to load orders");
        setOrders([]);
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
      !hasFetchedRef.current
    ) {
      if (document.visibilityState === "visible") {
        hasFetchedRef.current = true;
        fetchOrders();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [status, session]);

  if (status === "loading") {
    return (
      <div className="flex h-screen bg-[url('/background.jpg')] bg-cover bg-center text-white items-center justify-center">
        <div className="text-center text-black text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex h-screen bg-[url('/background.jpg')] bg-cover bg-center text-white items-center justify-center">
        <div className="text-center text-black text-lg">Please sign in to continue.</div>
      </div>
    );
  }

  const incompleteOrders = orders.filter(order => {
    try {
      const isDeliveredAndPaid =
        order.orderStatus === 'Delivered' &&
        Number(order.paymentAmt) === Number(order.paymentReceived);
      const isCancelled = order.orderStatus === 'Cancelled';
      return !(isDeliveredAndPaid || isCancelled);
    } catch {
      return true;
    }
  });

  return (
    <div className="flex flex-col md:flex-row h-screen bg-[url('/background.jpg')] bg-cover bg-center text-white overflow-hidden">
      {/* Mobile top bar */}
      <div className="md:hidden flex justify-between items-center p-4 bg-white bg-opacity-90 shadow">
        <img src="/logo.png" alt="Company Logo" className="w-24 h-auto" />
        <button
          onClick={() => router.push('/salesman/createOrder')}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded text-sm"
        >
          <PlusCircle className="w-5 h-5" /> Create Order
        </button>
      </div>

      {/* Sidebar (desktop only) */}
      <div className="hidden md:block w-64 bg-opacity-0 p-6">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Company Logo" className="w-40 h-auto" />
        </div>
        <div className="flex-col space-y-3">
          <button
            onClick={() => router.push('/salesman/createOrder')}
            className={`flex items-center gap-2 w-full px-6 py-3 rounded border font-semibold transition duration-200 ${
              pathname === '/salesman/createOrder'
                ? 'bg-blue-900 text-white hover:bg-blue-950'
                : 'bg-blue-100 text-blue-950 hover:text-white hover:bg-blue-950'
            }`}
          >
            <PlusCircle className="w-5 h-5" /> Create Order
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto bg-white bg-opacity-80 rounded-t-3xl md:rounded-none text-black">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-2">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold">Orders</h2>
            <p className="text-lg font-semibold">
              {session?.user?.name ? `Welcome back, ${session.user.name}!` : 'Welcome!'}
            </p>
          </div>
          <SignOutButton className="flex items-center gap-2 bg-blue-100 text-blue-950 font-semibold px-6 py-3 rounded border hover:text-white hover:bg-blue-950 transition duration-200">
            <LogOut className="w-5 h-5" /> Sign Out
          </SignOutButton>
        </div>

        {/* Orders list */}
        <div className="flex flex-col space-y-4 pb-6">
          {error ? (
            <div className="text-center text-red-600 text-lg py-10">
              Error: {error}
              <button 
                onClick={() => window.location.reload()} 
                className="block mx-auto mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          ) : isLoading ? (
            <div className="text-center text-black text-lg py-10 animate-pulse">
              Loading orders...
            </div>
          ) : incompleteOrders.length > 0 ? (
            incompleteOrders.map((order) => (
              <CompactOrderCard key={order._id || Math.random()} order={order} />
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
