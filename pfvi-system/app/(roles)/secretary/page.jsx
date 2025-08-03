'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Filter, ChevronDown, Package, History, UserPlus, LogOut } from "lucide-react";
import SignOutButton from "@/components/signout_button";
import CompactOrderCard from "@/components/secretary_order_card";

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedSalesman, setSelectedSalesman] = useState('All');
  const [selectedDriver, setSelectedDriver] = useState('All');

  // Dropdown states
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSalesmanDropdown, setShowSalesmanDropdown] = useState(false);
  const [showDriverDropdown, setShowDriverDropdown] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchOrders();
    }
  }, [status]);

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

  const refreshOrders = () => fetchOrders();

  // 🔹 Filter out completed/cancelled orders
  const incompleteOrders = orders.filter(order => {
    const isDeliveredAndPaid =
      order.orderStatus === 'Delivered' &&
      Number(order.paymentAmt) === Number(order.paymentReceived);
    const isCancelled = order.orderStatus === 'Cancelled';
    return !(isDeliveredAndPaid || isCancelled);
  });

  // 🔹 Unique salesmen & drivers
  const uniqueSalesmen = [
    'All',
    ...new Set(
      incompleteOrders
        .filter(o => o.salesmanID && o.salesmanID.firstName)
        .map(o => `${o.salesmanID.firstName} ${o.salesmanID.lastName}`)
    ),
  ];

  const uniqueDrivers = [
    'All',
    ...new Set(
      incompleteOrders
        .filter(o => o.driverAssignedID && o.driverAssignedID.firstName)
        .map(o => `${o.driverAssignedID.firstName} ${o.driverAssignedID.lastName}`)
    ),
  ];

  // 🔹 Apply search & filters
  const filteredOrders = incompleteOrders
    .filter(order => {
      if (searchQuery.trim() && !order.customerName.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (selectedSalesman !== 'All') {
        const salesmanName = order.salesmanID ? `${order.salesmanID.firstName} ${order.salesmanID.lastName}` : '';
        if (salesmanName !== selectedSalesman) return false;
      }
      if (selectedDriver !== 'All') {
        const driverName = order.driverAssignedID ? `${order.driverAssignedID.firstName} ${order.driverAssignedID.lastName}` : '';
        if (driverName !== selectedDriver) return false;
      }
      if (selectedFilter === 'Pending Delivery') {
        return Number(order.paymentAmt) === Number(order.paymentReceived) && order.orderStatus !== 'Delivered';
      }
      if (selectedFilter === 'Pending Payment') {
        return order.orderStatus === 'Delivered' && Number(order.paymentAmt) !== Number(order.paymentReceived);
      }
      return true;
    })
    .sort((a, b) => {
      if (selectedFilter === 'Recent') {
        return new Date(b.dateMade) - new Date(a.dateMade);
      }
      if (selectedFilter === 'Oldest') {
        return new Date(a.dateMade) - new Date(b.dateMade);
      }
      return 0;
    });

  return (
    <div className="flex h-screen bg-[url('/background.jpg')] bg-cover bg-center text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-50 bg-opacity-0 p-6">
        <div className="flex justify-center mb-8">
          <img src="/logo.png" alt="Company Logo" className="ml-15 w-40 h-auto" />
        </div>

        <div className="ml-2 flex-col w-50 p-3 space-y-3">
          <a
            href="/secretary"
            className="flex items-center gap-2 w-40 bg-blue-900 text-white font-semibold px-6 py-3 rounded border hover:bg-blue-950 transition duration-200"
          >
            <Package className="w-5 h-5" /> Current Orders
          </a>
          <a
            href="/secretary/history"
            className="flex items-center gap-2 w-40 bg-blue-100 text-blue-950 font-semibold px-6 py-3 rounded border hover:text-white hover:bg-blue-950 transition duration-200"
          >
            <History className="w-5 h-5" /> Order History
          </a>
          <button 
            onClick={() => router.push('/register')} 
            className="flex items-center gap-2 w-40 bg-blue-500 text-white font-semibold px-6 py-3 rounded border hover:bg-green-700 text-left"
          >
            <UserPlus className="w-5 h-5" /> Add New User
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 p-15 overflow-y-auto">
        {/* Heading + Welcome + Sign Out */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-black">Current Orders</h2>
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

        {/* Filters */}
        <div className="mb-6 flex items-center space-x-3 flex-wrap gap-4">
          {/* Search */}
          <div className="relative flex-grow max-w-md">
            <input
              type="text"
              placeholder="Search by customer name..."
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          </div>

          {/* Filter dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md flex items-center text-black"
            >
              <Filter className="h-4 w-4 mr-2" />
              {selectedFilter}
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
            {showFilterDropdown && (
              <div className="absolute mt-1 w-48 bg-white rounded-md shadow-lg z-10">
                {['All', 'Recent', 'Oldest', 'Pending Delivery', 'Pending Payment'].map(f => (
                  <button
                    key={f}
                    className={`block px-4 py-2 text-sm w-full text-left hover:bg-blue-50 ${
                      selectedFilter === f ? 'bg-blue-100 text-blue-900 font-medium' : 'text-blue-900'
                    }`}
                    onClick={() => { setSelectedFilter(f); setShowFilterDropdown(false); }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Salesman dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSalesmanDropdown(!showSalesmanDropdown)}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md flex items-center text-black"
            >
              Salesman: {selectedSalesman}
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
            {showSalesmanDropdown && (
              <div className="absolute mt-1 w-48 bg-white rounded-md shadow-lg z-10">
                {uniqueSalesmen.map(s => (
                  <button
                    key={s}
                    className={`block px-4 py-2 text-sm w-full text-left hover:bg-blue-50 ${
                      selectedSalesman === s ? 'bg-blue-100 text-blue-900 font-medium' : 'text-blue-900'
                    }`}
                    onClick={() => { setSelectedSalesman(s); setShowSalesmanDropdown(false); }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Driver dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDriverDropdown(!showDriverDropdown)}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md flex items-center text-black"
            >
              Driver: {selectedDriver}
              <ChevronDown className="h-4 w-4 ml-2" />
            </button>
            {showDriverDropdown && (
              <div className="absolute mt-1 w-48 bg-white rounded-md shadow-lg z-10">
                {uniqueDrivers.map(d => (
                  <button
                    key={d}
                    className={`block px-4 py-2 text-sm w-full text-left hover:bg-blue-50 ${
                      selectedDriver === d ? 'bg-blue-100 text-blue-900 font-medium' : 'text-blue-900'
                    }`}
                    onClick={() => { setSelectedDriver(d); setShowDriverDropdown(false); }}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Orders */}
        <div className="flex flex-col space-y-4 pb-6 pr-30">
          {isLoading ? (
            <div className="text-center text-black text-lg py-10 animate-pulse">
              Loading orders...
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
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
