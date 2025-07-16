'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import SignOutButton from "@/components/signout_button";
import CompactOrderCard from "@/components/order_card";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
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

    if (
      status === "authenticated" &&
      session &&
      document.visibilityState === "visible" &&
      !hasFetchedRef.current
    ) {
      hasFetchedRef.current = true;
      fetchOrders();
    }
  }, [status, session]);




  return (
    <div className="flex h-screen bg-[url('/background.jpg')] bg-cover bg-center text-white overflow-hidden">
      <div className="w-50 bg-opacity-0 p-6">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Company Logo" className="ml-15 w-40 h-auto" />
        </div>
        <div className="flex-col w-50 p-3">
          <button
            className="ml-2 w-40 bg-blue-900 text-white font-semibold block px-6 py-3 mb-5 rounded hover:text-white hover:bg-blue-950 transition duration-200 text-center"
            onClick={() => router.push('/salesman/createOrder')}
          >
            Create Order
          </button>
          <SignOutButton 
            className="ml-2 w-40 bg-blue-100 text-blue-950 font-semibold block px-6 py-3 rounded border hover:text-white hover:bg-blue-950 transition duration-200 text-center" 
          />
        </div>
      </div>

      <div className="flex-1 p-15 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="ml-40 text-4xl font-bold text-black">Orders</h2>
          <p className="mr-70 text-lg font-semibold text-black">
            {session?.user?.name ? `Welcome back, ${session.user.name}!` : ''}
          </p>
        </div>

        <div className="flex flex-col space-y-4 pb-6 pr-30">
          {isLoading ? (
            <div className="text-center text-black text-lg py-10 animate-pulse">
              Loading orders...
            </div>
          ) : orders.length > 0 ? (
            orders.map((order) => (
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
