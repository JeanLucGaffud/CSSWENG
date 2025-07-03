'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import SignOutButton from "@/components/signout_button";
import CompactOrderCard from "@/components/secretary_order_card";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      const fetchOrders = async () => {
        setIsLoading(true); // Show loading state
        try {
          const res = await fetch(`/api/secretaryorders`);
          const data = await res.json();
          setOrders(data);
        } catch (err) {
          console.error("Failed to fetch orders:", err);
        } finally {
          setIsLoading(false); // Hide loading state
        }
      };

      fetchOrders();
    }
  }, [status, session]);

  const handleFilterClick = (filterOption) => {
    setFilter(filterOption);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="flex h-screen bg-[url('/background.jpg')] bg-cover bg-center text-white overflow-hidden">
      <div className="w-50 bg-opacity-0 p-6">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Company Logo" className="ml-15 w-40 h-auto" />
        </div>
        <div className="flex-col w-50 p-3">
          <SignOutButton 
            className="w-40 bg-blue-100 text-blue-950 font-semibold block px-6 py-3 rounded border hover:text-white hover:bg-blue-950 transition duration-200 text-center" 
          />
        </div>
      </div>

      <div className="flex-1 p-15 overflow-y-auto">
        <div className="mb-6 flex items-center space-x-3">
          <div className="relative">
            <button 
              className="p-3 bg-blue-900 text-white rounded shadow-md"
              onClick={toggleDropdown}
            >
              Filter
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 bg-white text-black rounded shadow-lg mt-2 w-48">
                <ul>
                  {['Recent', 'Oldest', 'Delivered', 'Cancelled', 'Not Received'].map((option) => (
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
          <h2 className="text-2xl font-bold text-black">Orders</h2>
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
