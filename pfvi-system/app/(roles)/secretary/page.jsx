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
  const [error, setError] = useState(null);

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
    if (status === "authenticated" && session?.user) {
      fetchOrders();
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [status, session]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/orders`);
      
      //   Check if response is ok
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
      //   Validate response data
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        console.warn("Expected array but got:", typeof data);
        setOrders([]);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError(err.message || "Failed to load orders");
      setOrders([]); //   Reset orders on error
    } finally {
      setIsLoading(false);
    }
  };

  const refreshOrders = () => fetchOrders();

  //   Handle loading and unauthenticated states better
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

  //   Filter out completed/cancelled orders with error handling
  const incompleteOrders = orders.filter(order => {
    try {
      const isDeliveredAndPaid =
        order.orderStatus === 'Delivered' &&
        Number(order.paymentAmt) === Number(order.paymentReceived);
      const isCancelled = order.orderStatus === 'Cancelled';
      return !(isDeliveredAndPaid || isCancelled);
    } catch (err) {
      console.warn("Error filtering order:", order, err);
      return true; //   Include order if filtering fails
    }
  });

  //   Unique salesmen & drivers with safe property access
  const uniqueSalesmen = [
    'All',
    ...new Set(
      incompleteOrders
        .filter(o => o.salesmanID?.firstName && o.salesmanID?.lastName)
        .map(o => `${o.salesmanID.firstName} ${o.salesmanID.lastName}`)
    ),
  ];

  const uniqueDrivers = [
    'All',
    ...new Set(
      incompleteOrders
        .filter(o => o.driverAssignedID?.firstName && o.driverAssignedID?.lastName)
        .map(o => `${o.driverAssignedID.firstName} ${o.driverAssignedID.lastName}`)
    ),
  ];

  //   Apply search & filters with error handling
  const filteredOrders = incompleteOrders
    .filter(order => {
      try {
        // Safe search query check
        if (searchQuery.trim() && order.customerName && !order.customerName.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        
        // Safe salesman filter
        if (selectedSalesman !== 'All') {
          const salesmanName = order.salesmanID?.firstName && order.salesmanID?.lastName 
            ? `${order.salesmanID.firstName} ${order.salesmanID.lastName}` 
            : '';
          if (salesmanName !== selectedSalesman) return false;
        }
        
        // Safe driver filter
        if (selectedDriver !== 'All') {
          const driverName = order.driverAssignedID?.firstName && order.driverAssignedID?.lastName 
            ? `${order.driverAssignedID.firstName} ${order.driverAssignedID.lastName}` 
            : '';
          if (driverName !== selectedDriver) return false;
        }
        
        // Safe payment amount comparison
        if (selectedFilter === 'Pending Delivery') {
          const paymentAmt = Number(order.paymentAmt) || 0;
          const paymentReceived = Number(order.paymentReceived) || 0;
          return paymentAmt === paymentReceived && order.orderStatus !== 'Delivered';
        }
        
        if (selectedFilter === 'Pending Payment') {
          const paymentAmt = Number(order.paymentAmt) || 0;
          const paymentReceived = Number(order.paymentReceived) || 0;
          return order.orderStatus === 'Delivered' && paymentAmt !== paymentReceived;
        }
        
        return true;
      } catch (err) {
        console.warn("Error in filter logic for order:", order, err);
        return true; //   Include order if filtering fails
      }
    })
    .sort((a, b) => {
      try {
        if (selectedFilter === 'Recent') {
          return new Date(b.dateMade || 0) - new Date(a.dateMade || 0);
        }
        if (selectedFilter === 'Oldest') {
          return new Date(a.dateMade || 0) - new Date(b.dateMade || 0);
        }
        return 0;
      } catch (err) {
        console.warn("Error in sort logic:", err);
        return 0;
      }
    });

  //   Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      try {
        if (!event.target.closest('.dropdown-container')) {
          setShowFilterDropdown(false);
          setShowSalesmanDropdown(false);
          setShowDriverDropdown(false);
        }
      } catch (err) {
        console.warn("Error in click outside handler:", err);
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, []);

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
              {session?.user?.name ? `Welcome back, ${session.user.name}!` : 'Welcome!'}
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
          <div className="relative dropdown-container">
            <button
              onClick={() => {
                setShowFilterDropdown(!showFilterDropdown);
                setShowSalesmanDropdown(false);
                setShowDriverDropdown(false);
              }}
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
                    onClick={() => { 
                      setSelectedFilter(f); 
                      setShowFilterDropdown(false); 
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Salesman dropdown */}
          <div className="relative dropdown-container">
            <button
              onClick={() => {
                setShowSalesmanDropdown(!showSalesmanDropdown);
                setShowFilterDropdown(false);
                setShowDriverDropdown(false);
              }}
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
                    onClick={() => { 
                      setSelectedSalesman(s); 
                      setShowSalesmanDropdown(false); 
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Driver dropdown */}
          <div className="relative dropdown-container">
            <button
              onClick={() => {
                setShowDriverDropdown(!showDriverDropdown);
                setShowFilterDropdown(false);
                setShowSalesmanDropdown(false);
              }}
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
                    onClick={() => { 
                      setSelectedDriver(d); 
                      setShowDriverDropdown(false); 
                    }}
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
          {error ? (
            <div className="text-center text-red-600 text-lg py-10">
              Error: {error}
              <button 
                onClick={() => fetchOrders()} 
                className="block mx-auto mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          ) : isLoading ? (
            <div className="text-center text-black text-lg py-10 animate-pulse">
              Loading orders...
            </div>
          ) : filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <CompactOrderCard key={order._id || Math.random()} order={order} onRefresh={refreshOrders} />
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