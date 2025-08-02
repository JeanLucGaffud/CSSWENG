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
   const [search, setSearch] = useState("")

  useEffect(() => {
    if (status === "authenticated") {
      const fetchOrders = async () => {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/orders`);
          const data = await res.json();
          setOrders(data);
        } catch (err) {
          console.error("Failed to fetch orders:", err);
        } finally {
          setIsLoading(false);
        }
      };

      // Fetch only on mount, not on focus
      if (document.visibilityState === "visible") {
        fetchOrders();
      }
    }
  }, [status]);

  const handleFilterClick = (filterOption) => {
    setFilter(filterOption);
    setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const refreshOrders = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Failed to refresh orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[url('/background.jpg')] bg-cover bg-center text-white overflow-hidden">
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

          {/* Sign Up Button */}
          <button
            type="button"
            onClick={() => router.push('/register')}
            className="w-40 bg-blue-500 text-white font-semibold block px-6 py-3 rounded border hover:bg-green-700 transition duration-200 text-center"
          >
            Add New User
          </button>
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
                  {['Recent', 'Oldest', 'Pending Delivery', 'Pending Payment'].map((option) => (
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
            value={search}
            onChange={e => setSearch(e.target.value)}
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
            orders
              .filter(order => {
                // Filter by status or date
                if (filter === 'All') return true;
                if (filter === 'Recent') {
                  // Recent = most recent 30 days
                  const orderDate = new Date(order.dateMade);
                  const now = new Date();
                  return (now - orderDate) / (1000 * 60 * 60 * 24) <= 30;
                }
                if (filter === 'Oldest') {
                  // Oldest = more than 30 days ago
                  const orderDate = new Date(order.dateMade);
                  const now = new Date();
                  return (now - orderDate) / (1000 * 60 * 60 * 24) > 30;
                }
                if (filter === 'Pending Delivery') {
                  // Not yet delivered (orderStatus does not include 'delivered')
                  return order.orderStatus && !order.orderStatus.toLowerCase().includes('delivered');
                }
                if (filter === 'Pending Payment') {
                  // Delivered but not fully paid
                  const isDelivered = order.orderStatus && order.orderStatus.toLowerCase().includes('delivered');
                  const paymentAmt = Number(order.paymentAmt) || 0;
                  let paymentReceived = order.paymentReceived;
                  // Only treat 'Not set', 0, or '0' as pending
                  if (paymentReceived === 'Not set' || paymentReceived === 0 || paymentReceived === '0') {
                    paymentReceived = 0;
                  } else {
                    paymentReceived = Number(paymentReceived) || 0;
                  }
                  return isDelivered && paymentReceived < paymentAmt;
                }
                return true;
              })
              .filter(order => {
                // Search by customer name, invoice, contact number, or assigned salesman
                if (!search.trim()) return true;
                const q = search.trim().toLowerCase();
                // Salesman name logic
                let salesmanName = "";
                if (order.salesmanID) {
                  if (typeof order.salesmanID === "object") {
                    const { firstName, lastName } = order.salesmanID;
                    if (firstName && lastName) {
                      salesmanName = `${firstName} ${lastName}`.toLowerCase();
                    } else if (firstName) {
                      salesmanName = firstName.toLowerCase();
                    } else if (lastName) {
                      salesmanName = lastName.toLowerCase();
                    }
                  } else if (typeof order.salesmanID === "string") {
                    salesmanName = order.salesmanID.toLowerCase();
                  }
                }
                return (
                  (order.customerName && order.customerName.toLowerCase().includes(q)) ||
                  (order.invoice && order.invoice.toLowerCase().includes(q)) ||
                  (order.contactNumber && order.contactNumber.toLowerCase().includes(q)) ||
                  (salesmanName && salesmanName.includes(q))
                );
              })
              .map((order) => (
                <CompactOrderCard key={order._id} order={order} onRefresh={refreshOrders} />
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
