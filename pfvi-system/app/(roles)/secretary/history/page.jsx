'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SignOutButton from "@/components/signout_button";
import CompactOrderCard from "@/components/secretary_order_card";

export default function OrderHistory() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [historyOrders, setHistoryOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      const fetchHistory = async () => {
        setIsLoading(true);
        try {
          // Replace with your real endpoint when ready
          const res = await fetch(`/api/secretaryorders/history`);
          const data = await res.json();
          setHistoryOrders(data);
        } catch (err) {
          console.error("Failed to fetch history:", err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchHistory();
    }
  }, [status, session]);

  return (
    <div className="flex h-screen bg-[url('/background.jpg')] bg-cover bg-center text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-50 bg-opacity-0 p-6">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Company Logo" className="ml-15 w-40 h-auto" />
        </div>

        <div className="flex-col w-50 p-3 space-y-3">
          <SignOutButton 
            className="w-40 bg-blue-100 text-blue-950 font-semibold block px-6 py-3 rounded border hover:text-white hover:bg-blue-950 transition duration-200 text-center" 
          />

          <a
            href="/secretary"
            className="w-40 bg-blue-100 text-blue-950 font-semibold block px-6 py-3 rounded border hover:text-white hover:bg-blue-950 transition duration-200 text-center"
          >
            Current Orders
          </a>

          <a
            href="/secretary/history"
            className="w-40 bg-blue-100 text-blue-950 font-semibold block px-6 py-3 rounded border hover:text-white hover:bg-blue-950 transition duration-200 text-center"
          >
            Order History
          </a>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-15 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-black">Order History</h2>
          <p className="text-lg font-semibold text-black">
            {session?.user?.name ? `Welcome back, ${session.user.name}!` : ''}
          </p>
        </div>

        <div className="flex flex-col space-y-4 pb-6 pr-30">
          {isLoading ? (
            <div className="text-center text-black text-lg py-10 animate-pulse">
              Loading order history...
            </div>
          ) : historyOrders.length > 0 ? (
            historyOrders.map((order) => (
              <CompactOrderCard key={order._id} order={order} />
            ))
          ) : (
            <div className="text-center text-black text-lg py-10">
              No historical orders found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
