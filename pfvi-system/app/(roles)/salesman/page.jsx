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
  const [error, setError] = useState(null);

  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.user?.id) {
        console.warn("No valid session or user ID found");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      
      try {
        const res = await fetch(`/api/orders?salesmanID=${session.user.id}`);
        
        // Check if response is ok
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const data = await res.json();
        
        // Validate response data
        if (Array.isArray(data)) {
          setOrders(data);
        } else {
          console.warn("Expected array but got:", typeof data);
          setOrders([]);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError(err.message || "Failed to load orders");
        setOrders([]); //  Reset orders on error
      } finally {
        setIsLoading(false);
      }
    };

    const handleVisibilityChange = () => {
      //  Add try-catch for visibility API
      try {
        if (
          document.visibilityState === "visible" &&
          status === "authenticated" &&
          session?.user?.id
        ) {
          fetchOrders();
        }
      } catch (err) {
        console.warn("Visibility change handler error:", err);
      }
    };

    //  Only proceed if we have a valid session
    if (
      status === "authenticated" &&
      session?.user?.id &&
      !hasFetchedRef.current
    ) {
      //  Check document visibility safely
      const isVisible = typeof document !== 'undefined' ? 
        document.visibilityState === "visible" : true;
      
      if (isVisible) {
        hasFetchedRef.current = true;
        fetchOrders();
      }
    }

    if (typeof document !== 'undefined' && 'visibilityState' in document) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
      
      return () => {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      };
    }
  }, [status, session]);

  if (status === "loading") {
    return (
      <div className="flex h-screen bg-[url('/background.jpg')] bg-cover bg-center text-white items-center justify-center">
        <div className="text-center text-black text-lg animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex h-screen bg-[url('/background.jpg')] bg-cover bg-center text-white items-center justify-center">
        <div className="text-center text-black text-lg">
          Please sign in to continue.
        </div>
      </div>
    );
  }

  // Filter out completed/cancelled orders
  const incompleteOrders = orders.filter(order => {
    try {
      const isDeliveredAndPaid =
        order.orderStatus === 'Delivered' &&
        Number(order.paymentAmt) === Number(order.paymentReceived);
      const isCancelled = order.orderStatus === 'Cancelled';
      return !(isDeliveredAndPaid || isCancelled);
    } catch (err) {
      console.warn("Error filtering order:", order, err);
      return true;
    }
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
              {session?.user?.name ? `Welcome back, ${session.user.name}!` : 'Welcome!'}
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