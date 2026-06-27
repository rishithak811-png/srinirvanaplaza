import React, { useState, useEffect } from 'react';
import { Search, UserPlus, Eye, ShieldCheck, AlertCircle, X, RefreshCw, Clipboard, Clock, CheckCircle2, Ban, Sparkles } from 'lucide-react';

const STATUS_CONFIG = {
  Pending: { bg: 'bg-yellow-50 text-yellow-800 border-yellow-200', border: 'border-l-yellow-500', label: 'Pending' },
  Accepted: { bg: 'bg-blue-50 text-blue-800 border-blue-200', border: 'border-l-blue-500', label: 'Accepted' },
  Preparing: { bg: 'bg-indigo-50 text-indigo-800 border-indigo-200', border: 'border-l-indigo-500', label: 'Preparing' },
  'Out for Delivery': { bg: 'bg-purple-50 text-purple-800 border-purple-200', border: 'border-l-purple-500', label: 'Out for Delivery' },
  Delivered: { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', border: 'border-l-emerald-500', label: 'Delivered' },
  Closed: { bg: 'bg-gray-100 text-gray-800 border-gray-200', border: 'border-l-gray-400', label: 'Closed' },
  Cancelled: { bg: 'bg-red-50 text-red-800 border-red-200', border: 'border-l-red-500', label: 'Cancelled' }
};

const NEXT_STATUS_ACTIONS = {
  Pending: { next: 'Accepted', action: 'Accept' },
  Accepted: { next: 'Preparing', action: 'Prepare' },
  Preparing: { next: 'Out for Delivery', action: 'Dispatch' },
  'Out for Delivery': { next: 'Delivered', action: 'Deliver' },
  Delivered: { next: 'Closed', action: 'Close' }
};

export default function StaffDashboard() {
  const [orders, setOrders] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Operational Queue Tab: 'active' | 'completed' | 'cancelled' | 'all'
  const [queueTab, setQueueTab] = useState('active');

  // Search/Filters
  const [filterRoom, setFilterRoom] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Inspector Panel State
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  
  // Assignment/Note inputs
  const [assigningOrderId, setAssigningOrderId] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [statusNotes, setStatusNotes] = useState('');

  // Shift Handovers and Pacification states
  const [staffSubTab, setStaffSubTab] = useState('queue');
  const [handoverList, setHandoverList] = useState([]);
  const [handoverBy, setHandoverBy] = useState('');
  const [handoverTo, setHandoverTo] = useState('');
  const [shiftType, setShiftType] = useState('Morning to Afternoon');
  const [handoverNotes, setHandoverNotes] = useState('');
  const [submittingHandover, setSubmittingHandover] = useState(false);

  const [pacifyingOrderId, setPacifyingOrderId] = useState(null);
  const [selectedPacifyItem, setSelectedPacifyItem] = useState('');

  // Housekeeping Tasks and Guest Enquiries states
  const [housekeepingTasksList, setHousekeepingTasksList] = useState([]);
  const [enquiriesList, setEnquiriesList] = useState([]);
  const [hkRoomNumber, setHkRoomNumber] = useState('');
  const [hkDescription, setHkDescription] = useState('');
  const [hkAssignedStaffId, setHkAssignedStaffId] = useState('');
  const [submittingHk, setSubmittingHk] = useState(false);
  const [answeringEnquiryId, setAnsweringEnquiryId] = useState(null);
  const [enquiryAnswer, setEnquiryAnswer] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const fetchHandovers = async () => {
    try {
      const response = await fetch('http://localhost:5001/orders/shift-handovers');
      if (response.ok) {
        const data = await response.json();
        setHandoverList(data);
      }
    } catch (err) {
      console.error("Failed to load handovers", err);
    }
  };

  const fetchHousekeepingTasks = async () => {
    try {
      const response = await fetch('http://localhost:5001/orders/housekeeping');
      if (response.ok) {
        const data = await response.json();
        setHousekeepingTasksList(data);
      }
    } catch (err) {
      console.error("Failed to load housekeeping tasks", err);
    }
  };

  const fetchEnquiries = async () => {
    try {
      const response = await fetch('http://localhost:5001/orders/enquiries');
      if (response.ok) {
        const data = await response.json();
        setEnquiriesList(data);
      }
    } catch (err) {
      console.error("Failed to load guest enquiries", err);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams();
      if (filterRoom) q.append('room', filterRoom);
      if (searchQuery) q.append('search', searchQuery);

      const response = await fetch(`http://localhost:5001/orders?${q.toString()}`);
      if (!response.ok) throw new Error("Failed to load queue.");
      let data = await response.json();

      // Filter by status group on client-side to ensure precise tab segmentation
      if (queueTab === 'active') {
        data = data.filter(o => ['Pending', 'Accepted', 'Preparing', 'Out for Delivery'].includes(o.status));
      } else if (queueTab === 'completed') {
        data = data.filter(o => ['Delivered', 'Closed'].includes(o.status));
      } else if (queueTab === 'cancelled') {
        data = data.filter(o => o.status === 'Cancelled');
      }

      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch('http://localhost:5001/orders/staff');
      if (response.ok) {
        const data = await response.json();
        setStaffList(data);
      }
    } catch (err) {
      console.error("Failed to load staff list", err);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStaff();
    fetchHandovers();
    fetchHousekeepingTasks();
    fetchEnquiries();
  }, [queueTab, filterRoom, staffSubTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleCreateHkTask = async (e) => {
    e.preventDefault();
    if (!hkRoomNumber || !hkDescription) {
      alert("Room number and task description are required.");
      return;
    }
    setSubmittingHk(true);
    try {
      const response = await fetch('http://localhost:5001/orders/housekeeping/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: hkRoomNumber,
          taskDescription: hkDescription,
          assignedStaffId: hkAssignedStaffId || null
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to create task");

      setHkRoomNumber('');
      setHkDescription('');
      setHkAssignedStaffId('');
      fetchHousekeepingTasks();
      alert("Housekeeping task created successfully.");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingHk(false);
    }
  };

  const handleUpdateHkStatus = async (taskId, nextStatus, staffId) => {
    try {
      const body = { status: nextStatus };
      if (staffId !== undefined) {
        body.assignedStaffId = staffId || null;
      }
      const response = await fetch(`http://localhost:5001/orders/housekeeping/${taskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to update task");

      fetchHousekeepingTasks();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAnswerEnquiry = async (enquiryId) => {
    if (!enquiryAnswer) return;
    setSubmittingAnswer(true);
    try {
      const response = await fetch(`http://localhost:5001/orders/enquiries/${enquiryId}/answer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: enquiryAnswer })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to answer enquiry");

      setAnsweringEnquiryId(null);
      setEnquiryAnswer('');
      fetchEnquiries();
      alert("Answer submitted and logged successfully.");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleViewDetails = async (orderId) => {
    setDetailLoading(true);
    try {
      const response = await fetch(`http://localhost:5001/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data);
      }
    } catch (err) {
      console.error("Failed to load logs", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAssignStaff = async (orderId) => {
    if (!selectedStaffId) return;
    try {
      const response = await fetch(`http://localhost:5001/orders/${orderId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          staffId: selectedStaffId,
          assignedBy: 'Duty Desk Coordinator'
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Assignment failed");
      
      setAssigningOrderId(null);
      setSelectedStaffId('');
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        handleViewDetails(orderId);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (orderId, nextStatus) => {
    try {
      const response = await fetch(`http://localhost:5001/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: nextStatus,
          notes: statusNotes || `Moved order to status: ${nextStatus}`,
          changedBy: 'Staff Operator'
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      setStatusNotes('');
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        handleViewDetails(orderId);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdateAvailability = async (orderId, availabilityStatus, customNotes) => {
    try {
      const response = await fetch(`http://localhost:5001/orders/${orderId}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          availabilityStatus,
          notes: customNotes || (availabilityStatus === 'Available' ? 'Item confirmed as Available' : 'Item is out of stock / unavailable'),
          changedBy: 'Staff Operator'
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        handleViewDetails(orderId);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handlePacifyOrder = async (orderId) => {
    if (!selectedPacifyItem) return;
    try {
      const response = await fetch(`http://localhost:5001/orders/${orderId}/pacify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: selectedPacifyItem })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to offer complimentary item");
      
      setPacifyingOrderId(null);
      setSelectedPacifyItem('');
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        handleViewDetails(orderId);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateHandover = async (e) => {
    e.preventDefault();
    if (!handoverBy || !handoverTo || !handoverNotes) {
      alert("Please fill all handover fields.");
      return;
    }
    setSubmittingHandover(true);
    try {
      const response = await fetch('http://localhost:5001/orders/shift-handovers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handoverBy,
          handoverTo,
          shiftType,
          notes: handoverNotes
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to submit handover");
      
      setHandoverNotes('');
      fetchHandovers();
      alert("Shift handover logged successfully.");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmittingHandover(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Confirm cancelling order?")) return;
    try {
      const response = await fetch(`http://localhost:5001/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'Cancelled',
          notes: 'Cancelled from Staff Dashboard overrides',
          changedBy: 'Staff Operator'
        })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      fetchOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        handleViewDetails(orderId);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const getAIAlerts = () => {
    const alerts = [];
    const suggestions = [];
    
    const pending = orders.filter(o => o.status === 'Pending');
    const preparing = orders.filter(o => o.status === 'Preparing');
    const urgentUnassigned = orders.filter(o => ['High', 'Urgent'].includes(o.priority) && o.status === 'Pending');
    
    if (urgentUnassigned.length > 0) {
      urgentUnassigned.forEach(o => {
        alerts.push({
          type: 'Urgent',
          message: `Urgent! Room ${o.room_number} needs assignment.`
        });
      });
    }
    
    orders.forEach(o => {
      if (['Pending', 'Accepted', 'Preparing'].includes(o.status)) {
        const elapsed = (Date.now() - new Date(o.created_at)) / 1000 / 60;
        if (elapsed > 10) {
          alerts.push({
            type: 'Delay',
            message: `#${o.id} is delayed by ${Math.round(elapsed)}m.`
          });
        }
      }
    });
    
    if (pending.length > 0) {
      suggestions.push(`Assign the ${pending.length} pending requests.`);
    }
    const foodPrepCount = preparing.filter(o => o.category === 'Food').length;
    if (foodPrepCount > 2) {
      suggestions.push(`Kitchen Alert: ${foodPrepCount} active food orders.`);
    }
    if (suggestions.length === 0) {
      suggestions.push("All queues operating inside SLA.");
    }
    
    const occupiedSet = new Set(orders.map(o => o.room_number));
    const rate = Math.round((occupiedSet.size / 50) * 100);
    const summary = `System Active. Tracking ${orders.length} orders. Hotel Occupancy: ${rate}% (${occupiedSet.size}/50 rooms). ${pending.length} pending requests.`;
    
    return { summary, alerts, suggestions };
  };

  const aiSummary = getAIAlerts();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6 animate-fade-in">
      
      {/* 1. Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-150 pb-4">
        <div>
          <h3 className="text-2xl font-serif font-bold text-hotel-navy">Fulfillment Console</h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Sri Nirvana Plaza Staff Panel</p>
        </div>
        
        {/* Quick Search & Refresh */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search request or guest..."
            className="w-full sm:w-56 px-3 py-1.5 bg-hotel-cream border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold"
          />
          <button
            type="submit"
            className="p-1.5 bg-hotel-navy hover:bg-hotel-gold text-white hover:text-hotel-navy border border-hotel-gold/20 rounded-lg"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={fetchOrders}
            className="p-1.5 border border-gray-200 bg-white rounded-lg text-gray-500 hover:text-hotel-gold hover:border-hotel-gold/30 hover:rotate-180 transition-all duration-500"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Staff Sub-Tabs */}
      <div className="flex border-b border-gray-200 flex-wrap gap-y-1">
        <button
          onClick={() => setStaffSubTab('queue')}
          className={`px-4 py-2 text-xs uppercase tracking-wider font-bold border-b-2 transition-all ${
            staffSubTab === 'queue' ? 'border-hotel-gold text-hotel-navy font-extrabold' : 'border-transparent text-gray-400 hover:text-hotel-navy'
          }`}
        >
          Fulfillment Queue
        </button>
        <button
          onClick={() => setStaffSubTab('housekeeping')}
          className={`px-4 py-2 text-xs uppercase tracking-wider font-bold border-b-2 transition-all ${
            staffSubTab === 'housekeeping' ? 'border-hotel-gold text-hotel-navy font-extrabold' : 'border-transparent text-gray-400 hover:text-hotel-navy'
          }`}
        >
          Housekeeping Tasks ({housekeepingTasksList.length})
        </button>
        <button
          onClick={() => setStaffSubTab('enquiries')}
          className={`px-4 py-2 text-xs uppercase tracking-wider font-bold border-b-2 transition-all ${
            staffSubTab === 'enquiries' ? 'border-hotel-gold text-hotel-navy font-extrabold' : 'border-transparent text-gray-400 hover:text-hotel-navy'
          }`}
        >
          Guest Enquiries ({enquiriesList.length})
        </button>
        <button
          onClick={() => setStaffSubTab('handovers')}
          className={`px-4 py-2 text-xs uppercase tracking-wider font-bold border-b-2 transition-all ${
            staffSubTab === 'handovers' ? 'border-hotel-gold text-hotel-navy font-extrabold' : 'border-transparent text-gray-400 hover:text-hotel-navy'
          }`}
        >
          Shift Handovers ({handoverList.length})
        </button>
      </div>

      {/* AI Operational Alert Panel */}
      <div className="bg-gradient-to-br from-hotel-navy/95 to-hotel-slate/95 backdrop-blur-md border border-hotel-gold/30 rounded-2xl p-5 shadow-[0_8px_32px_rgba(212,175,55,0.1)] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-hotel-gold/50 transition-all duration-300">
        <div className="space-y-1 grow">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-hotel-gold text-hotel-navy text-[9px] font-extrabold uppercase tracking-wider rounded">
              AI Advisor
            </span>
            <h4 className="text-xs font-serif font-bold tracking-wider text-hotel-gold uppercase">Sri Nirvana Plaza Operational Alert Engine</h4>
          </div>
          <p className="text-[11px] text-gray-300 leading-snug">
            {aiSummary.summary}
          </p>
        </div>
        
        {/* Alerts and Suggestions badges */}
        <div className="flex flex-wrap gap-2 shrink-0 max-w-full">
          {aiSummary.alerts.slice(0, 2).map((alert, idx) => (
            <div key={idx} className="bg-red-500/20 border border-red-500/40 text-red-200 px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1.5 font-bold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              <span>{alert.message}</span>
            </div>
          ))}
          {aiSummary.suggestions.slice(0, 2).map((sug, idx) => (
            <div key={idx} className="bg-yellow-500/15 border border-yellow-500/30 text-yellow-200 px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1.5 font-bold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
              <span>{sug}</span>
            </div>
          ))}
        </div>
      </div>

      {staffSubTab === 'queue' && (
        <>
          {/* 2. Primary Queue Tab Switcher */}
      <div className="flex justify-between items-center bg-white border border-gray-150/70 p-2 rounded-2xl shadow-md flex-wrap gap-3">
        <div className="flex gap-1.5">
          {[
            { id: 'active', label: 'Active Queue', icon: Clock, color: 'text-amber-600 bg-amber-50 border-amber-200' },
            { id: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
            { id: 'cancelled', label: 'Cancelled', icon: Ban, color: 'text-red-600 bg-red-50 border-red-200' },
            { id: 'all', label: 'All Requests', icon: Clipboard, color: 'text-slate-600 bg-slate-50 border-slate-200' }
          ].map((tab) => {
            const TabIcon = tab.icon;
            const isActive = queueTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setQueueTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-luxury ${
                  isActive 
                    ? 'bg-hotel-navy text-white shadow-sm font-bold border border-hotel-navy' 
                    : 'text-gray-500 hover:bg-gray-150 hover:text-hotel-navy border border-transparent'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Small Room Quick Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-gray-400">Room:</span>
          <input
            type="text"
            value={filterRoom}
            onChange={(e) => setFilterRoom(e.target.value)}
            placeholder="Filter Room"
            className="w-20 px-2 py-1 bg-hotel-cream border border-gray-200 rounded text-xs focus:outline-none"
          />
        </div>
      </div>

      {/* 3. Main Workspace: Zendesk Style Equal Height Columns */}
      <div className="flex flex-col lg:flex-row gap-6 items-stretch h-auto lg:h-[580px]">
        {/* Left Side: Order Queue Card */}
        <div className="w-full lg:w-2/3 flex flex-col bg-white border border-gray-150 rounded-2xl shadow-md overflow-hidden h-[480px] lg:h-full transition-all duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-hotel-cream to-white px-5 py-3 border-b border-gray-150 flex justify-between items-center shrink-0">
            <span className="font-serif font-extrabold text-xs uppercase tracking-wider text-hotel-navy flex items-center gap-1.5">
              Queue Feed ({orders.length} requests)
            </span>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {error && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="h-full flex flex-col items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 text-hotel-gold animate-spin mb-2" />
                <p className="text-xs text-gray-400 uppercase tracking-widest">Refreshing Console...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-150 rounded-xl">
                <Clipboard className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Queue is Empty</p>
                <p className="text-[11px] text-gray-400 mt-1">No orders match this queue filter.</p>
              </div>
            ) : (
              orders.map((order) => {
                const config = STATUS_CONFIG[order.status] || { bg: 'bg-gray-50', border: 'border-l-gray-300', label: order.status };
                const nextStep = NEXT_STATUS_ACTIONS[order.status];

                const elapsedMin = (Date.now() - new Date(order.created_at)) / 1000 / 60;
                const isDelayed = ['Pending', 'Accepted', 'Preparing'].includes(order.status) && elapsedMin > 5;

                const priorityColors = {
                  Low: 'bg-slate-55 text-slate-700 border-slate-200 bg-slate-50',
                  Medium: 'bg-blue-55 text-blue-700 border-blue-200 bg-blue-50',
                  High: 'bg-orange-55 text-orange-700 border-orange-200 bg-orange-50',
                  Urgent: 'bg-red-55 text-red-700 border-red-200 bg-red-50 animate-pulse'
                };
                const prioBg = priorityColors[order.priority] || 'bg-gray-50 text-gray-700 border-gray-200';
                
                return (
                  <div
                    key={order.id}
                    className={`bg-white border ${
                      isDelayed 
                        ? 'border-red-200 ring-2 ring-red-500/10 bg-gradient-to-br from-white to-red-50/10' 
                        : 'border-gray-150'
                    } border-l-4 ${config.border} rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:scale-[1.005] flex flex-col gap-3`}
                  >
                    {/* 1. Header Row */}
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-hotel-navy text-hotel-gold border border-hotel-gold/30 rounded-lg text-[9px] font-bold tracking-wider">
                          #{order.id}
                        </span>
                        <span className="font-serif font-extrabold text-base text-hotel-navy">
                          Room {order.room_number}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {order.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold rounded-md border ${config.bg}`}>
                          {config.label}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold rounded-md border ${prioBg}`}>
                          {order.priority || 'Medium'}
                        </span>
                      </div>
                    </div>

                    {/* 2. Description & Details Section */}
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <h4 className="font-sans font-bold text-hotel-navy text-sm md:text-base tracking-tight">
                          {order.item_detail}
                        </h4>
                        <span className="px-2 py-0.5 bg-hotel-cream border border-hotel-gold/25 text-hotel-gold font-extrabold text-xs rounded-full">
                          x{order.quantity}
                        </span>
                      </div>

                      {order.special_instructions && (
                        <div className="p-2.5 bg-hotel-cream border-l-2 border-hotel-gold/40 rounded-r-lg text-[11px] text-hotel-navy/85 italic leading-relaxed">
                          <strong>Guest Note:</strong> "{order.special_instructions}"
                        </div>
                      )}

                      {/* Warnings / Badges */}
                      <div className="flex flex-col gap-1.5">
                        {order.complimentary_item && (
                          <div className="p-2 bg-emerald-50 border border-emerald-150 text-emerald-800 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 animate-fade-in shadow-xs">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                            <span>Pacification Gift Sent: <strong className="text-emerald-950">{order.complimentary_item}</strong></span>
                          </div>
                        )}

                        {isDelayed && !order.complimentary_item && (
                          <div className="p-2 bg-rose-50 border border-rose-150 text-rose-800 rounded-lg text-[10px] font-bold flex items-center gap-1.5 animate-pulse shadow-xs">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Delayed by {Math.round(elapsedMin)} mins! Please offer a pacifying complimentary item.</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Subtle Divider */}
                    <div className="border-t border-gray-100 my-1"></div>

                    {/* 3. Footer Meta & Actions Row */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-1 text-[11px]">
                      {/* Left: Metadata badges */}
                      <div className="flex items-center gap-3.5 flex-wrap text-gray-500 font-medium">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span>Created: <strong>{new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-hotel-gold"></span>
                          <span>Staff: <strong className="text-hotel-navy font-semibold">{order.staff_name || 'Unassigned'}</strong></span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {order.availability_status === 'Available' ? (
                            <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-extrabold uppercase rounded">
                              ✓ Checked Available
                            </span>
                          ) : order.availability_status === 'Unavailable' ? (
                            <span className="px-1.5 py-0.5 bg-red-50 text-red-700 border border-red-200 text-[8px] font-extrabold uppercase rounded">
                              ✗ Out of Stock
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 bg-amber-50 text-amber-750 border border-amber-200 text-[8px] font-extrabold uppercase rounded">
                              Stock: Unverified
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right: Action Buttons Group */}
                      <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-end">
                        {/* Stock Check (Available/Out of Stock) */}
                        {(order.availability_status === 'Pending' || !order.availability_status) && ['Pending', 'Accepted', 'Preparing'].includes(order.status) && (
                          <div className="flex items-center gap-1 bg-yellow-50/70 p-1 rounded-lg border border-yellow-250/50 shadow-xs">
                            <span className="text-[8px] font-bold text-yellow-800 uppercase tracking-wider px-1">Check stock:</span>
                            <button
                              onClick={() => handleUpdateAvailability(order.id, 'Available')}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[8px] font-bold uppercase tracking-wider transition-all duration-200"
                            >
                              Available
                            </button>
                            <button
                              onClick={() => {
                                const reason = window.prompt("Enter reason for unavailability (optional):", "Item is currently out of stock");
                                if (reason !== null) {
                                  handleUpdateAvailability(order.id, 'Unavailable', reason);
                                }
                              }}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[8px] font-bold uppercase tracking-wider transition-all duration-200"
                            >
                              Out of Stock
                            </button>
                          </div>
                        )}

                        {/* Staff Assignment Selector */}
                        {assigningOrderId === order.id ? (
                          <div className="flex items-center gap-1.5 bg-hotel-cream p-1 rounded-lg border border-gray-250 shadow-xs">
                            <select
                              value={selectedStaffId}
                              onChange={(e) => setSelectedStaffId(e.target.value)}
                              className="px-2 py-1 bg-white border border-gray-250 rounded text-[9px] focus:outline-none font-bold"
                            >
                              <option value="">Choose Personnel</option>
                              {staffList
                                .filter(s => {
                                  const targetRole = order.category === 'Food' ? 'Kitchen' : order.category;
                                  return s.role.toLowerCase() === targetRole.toLowerCase() || order.category === 'Other';
                                })
                                .map(s => (
                                  <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                                ))}
                            </select>
                            <button
                              onClick={() => handleAssignStaff(order.id)}
                              className="px-2 py-1 bg-hotel-navy text-white text-[9px] font-bold uppercase tracking-wider rounded"
                            >
                              OK
                            </button>
                            <button
                              onClick={() => setAssigningOrderId(null)}
                              className="p-1 hover:bg-gray-150 rounded text-gray-400 hover:text-gray-600"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          ['Pending', 'Accepted', 'Preparing', 'Out for Delivery'].includes(order.status) && (
                            <button
                              onClick={() => {
                                setAssigningOrderId(order.id);
                                setSelectedStaffId(order.assigned_staff_id || '');
                              }}
                              className="px-2.5 py-1 border border-hotel-gold/40 text-hotel-gold hover:bg-yellow-50/50 hover:border-hotel-gold rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 transition-all"
                            >
                              <UserPlus className="w-3.5 h-3.5" />
                              <span>{order.status === 'Pending' ? 'Assign & Accept' : 'Assign Staff'}</span>
                            </button>
                          )
                        )}

                        {/* Next Workflow status dispatch/deliver/close */}
                        {nextStep && order.status !== 'Pending' && (
                          <button
                            onClick={() => handleUpdateStatus(order.id, nextStep.next)}
                            className="px-3 py-1 bg-gradient-to-r from-hotel-navy to-hotel-slate hover:from-hotel-gold hover:to-hotel-goldDark text-white hover:text-hotel-navy rounded-lg text-[9px] font-bold uppercase tracking-widest transition-luxury shadow-md hover:shadow-lg active:scale-95"
                          >
                            {nextStep.action}
                          </button>
                        )}

                        {/* Late Order Pacification */}
                        {isDelayed && !order.complimentary_item && (
                          pacifyingOrderId === order.id ? (
                            <div className="flex items-center gap-1 bg-yellow-50 p-1 rounded-lg border border-yellow-250 shadow-xs">
                              <select
                                value={selectedPacifyItem}
                                onChange={(e) => setSelectedPacifyItem(e.target.value)}
                                className="px-2 py-1 bg-white border border-gray-250 rounded text-[9px] focus:outline-none font-bold"
                              >
                                <option value="">Gift Item</option>
                                <option value="Gourmet Cookies">Gourmet Cookies</option>
                                <option value="Chilled Juice Box">Chilled Juice Box</option>
                                <option value="Fresh Fruit Platter">Fresh Fruit Platter</option>
                                <option value="Premium Coffee">Premium Coffee</option>
                              </select>
                              <button
                                onClick={() => handlePacifyOrder(order.id)}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9px] font-bold uppercase"
                              >
                                Send
                              </button>
                              <button
                                onClick={() => setPacifyingOrderId(null)}
                                className="p-1 hover:bg-gray-150 rounded text-gray-400"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setPacifyingOrderId(order.id);
                                setSelectedPacifyItem('');
                              }}
                              className="px-2.5 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center gap-1 shadow-sm border border-emerald-300 hover:opacity-90 active:scale-95"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-white animate-pulse" />
                              <span>Pacify</span>
                            </button>
                          )
                        )}

                        {/* Detail Logs Inspector */}
                        <button
                          onClick={() => handleViewDetails(order.id)}
                          className={`p-1.5 border rounded-lg hover:bg-gray-100 transition-all ${
                            selectedOrder && selectedOrder.id === order.id 
                              ? 'border-hotel-gold text-hotel-gold bg-yellow-50/20 shadow-inner' 
                              : 'border-gray-200 text-gray-400 hover:text-hotel-navy hover:border-gray-300'
                          }`}
                          title="View Ticket Logs"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Inspector Panel (Full Height Matching) */}
        <div className="w-full lg:w-1/3 flex flex-col bg-white border border-gray-150 rounded-2xl shadow-md overflow-hidden h-[480px] lg:h-full transition-all duration-300">
          {selectedOrder ? (
            <div className="flex flex-col h-full animate-fade-in">
              {/* Header */}
              <div className="bg-gradient-to-r from-hotel-cream to-white px-5 py-3 border-b border-gray-150 flex justify-between items-center shrink-0">
                <div>
                  <h4 className="text-xs font-serif font-extrabold text-hotel-navy">Ticket Logs Inspector</h4>
                  <p className="text-[9px] text-hotel-gold uppercase tracking-widest font-bold">Order #{selectedOrder.id}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1 hover:bg-gray-200 rounded text-gray-400"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable details */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Meta details */}
                <div className="text-xs space-y-2.5 bg-hotel-cream p-3 rounded-lg border border-gray-150">
                  <div className="flex justify-between border-b border-gray-200/50 pb-1">
                    <span className="text-gray-400 uppercase text-[9px] tracking-wide">Guest Name / Room</span>
                    <span className="font-bold text-hotel-navy">{selectedOrder.guest_name} (Room {selectedOrder.room_number})</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200/50 pb-1">
                    <span className="text-gray-400 uppercase text-[9px] tracking-wide">Mobile Number</span>
                    <span className="font-bold text-hotel-navy">{selectedOrder.mobile_number}</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-200/50 pb-1">
                    <span className="text-gray-400 uppercase text-[9px] tracking-wide">Service Item</span>
                    <span className="font-bold text-hotel-navy text-right">{selectedOrder.item_detail} (x{selectedOrder.quantity})</span>
                  </div>
                  {selectedOrder.special_instructions && (
                    <div className="pt-2 text-[11px] text-amber-900 italic border-t border-gray-200/30">
                      "{selectedOrder.special_instructions}"
                    </div>
                  )}
                </div>

                {/* Availability Section in Inspector */}
                <div className="bg-white p-3 rounded-lg border border-gray-150 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 uppercase text-[9px] tracking-wide font-semibold">Availability Check</span>
                    {selectedOrder.availability_status === 'Available' ? (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-250 text-[9px] font-bold rounded">
                        ✓ Checked & Available
                      </span>
                    ) : selectedOrder.availability_status === 'Unavailable' ? (
                      <span className="px-2 py-0.5 bg-red-50 text-red-800 border border-red-200 text-[9px] font-bold rounded">
                        ✗ Out of Stock (Cancelled)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-bold rounded">
                        Pending Verification
                      </span>
                    )}
                  </div>
                  
                  {(selectedOrder.availability_status === 'Pending' || !selectedOrder.availability_status) && ['Pending', 'Accepted', 'Preparing'].includes(selectedOrder.status) && (
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleUpdateAvailability(selectedOrder.id, 'Available')}
                        className="flex-1 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9px] font-bold uppercase tracking-wider text-center"
                      >
                        Confirm Available
                      </button>
                      <button
                        onClick={() => {
                          const reason = window.prompt("Enter reason for unavailability (optional):", "Item is currently out of stock");
                          if (reason !== null) {
                            handleUpdateAvailability(selectedOrder.id, 'Unavailable', reason);
                          }
                        }}
                        className="flex-1 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[9px] font-bold uppercase tracking-wider text-center"
                      >
                        Out of Stock
                      </button>
                    </div>
                  )}
                </div>

                {/* Progress updates inputs */}
                {['Pending', 'Accepted', 'Preparing', 'Out for Delivery'].includes(selectedOrder.status) && (
                  <div className="bg-yellow-50/10 p-3 rounded-lg border border-yellow-200/30 space-y-2">
                    <label className="block text-[9px] uppercase tracking-wider font-bold text-gray-400">Add Log Progress Note</label>
                    <input
                      type="text"
                      value={statusNotes}
                      onChange={(e) => setStatusNotes(e.target.value)}
                      placeholder="e.g. Preparing food, heading upstairs..."
                      className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] focus:outline-none"
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleCancelOrder(selectedOrder.id)}
                        className="px-2 py-1 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg text-[9px] uppercase font-bold tracking-wider"
                      >
                        Cancel Order
                      </button>
                    </div>
                  </div>
                )}

                {/* History timeline log list */}
                <div className="space-y-3">
                  <h5 className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Fulfillment Audit Trail</h5>
                  <div className="space-y-3 pl-1 max-h-36 overflow-y-auto">
                    {selectedOrder.history && selectedOrder.history.map((log) => (
                      <div key={log.id} className="relative pl-3.5 border-l border-hotel-gold/30 text-[11px]">
                        <div className="absolute -left-[3.5px] top-1.5 w-1.5 h-1.5 rounded-full bg-hotel-gold"></div>
                        <div className="flex justify-between font-bold text-hotel-navy">
                          <span>{log.changed_by}</span>
                          <span className="text-gray-400 font-medium text-[8px]">
                            {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-gray-500 mt-0.5 leading-tight">{log.notes}</p>
                        <span className="inline-block mt-0.5 px-1 py-0.1 bg-gray-50 text-[7px] border border-gray-150 uppercase tracking-wide text-gray-400 font-semibold rounded">
                          {log.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mock notifications log list */}
                <div className="space-y-2 border-t border-gray-100 pt-3">
                  <h5 className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Generated Notifications</h5>
                  <div className="space-y-2 pl-1 max-h-28 overflow-y-auto">
                    {selectedOrder.notifications && selectedOrder.notifications.map((n) => (
                      <div key={n.id} className="bg-hotel-cream p-2 border border-gray-150 rounded text-[10px]">
                        <div className="flex justify-between font-bold text-hotel-gold uppercase text-[7px] tracking-wide mb-1">
                          <span>{n.recipient_role} ({n.type})</span>
                          <span className="text-emerald-600">{n.sent_status}</span>
                        </div>
                        <p className="text-gray-500 leading-snug">{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center text-xs text-gray-400">
              <Eye className="w-8 h-8 text-gray-300 mb-2" />
              <p className="font-semibold uppercase tracking-wider text-hotel-navy">No Ticket Selected</p>
              <p className="text-[10px] text-gray-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                Click the eye icon next to a ticket to load full workflow audit logs and simulated notifications.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )}

      {staffSubTab === 'housekeeping' && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch animate-fade-in">
           {/* Left Side: Create Housekeeping Task Form */}
           <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
             <div>
               <h4 className="text-xs uppercase tracking-wider font-bold text-hotel-navy flex items-center gap-1.5">
                 <Clipboard className="w-4.5 h-4.5 text-hotel-gold" />
                 <span>Dispatch Housekeeping</span>
               </h4>
               <p className="text-[10px] text-gray-400">Create and assign a new housekeeping task</p>
             </div>

             <form onSubmit={handleCreateHkTask} className="space-y-4 text-xs">
               <div>
                 <label className="block text-gray-500 font-semibold mb-1 uppercase text-[9px] tracking-wider">Room Number</label>
                 <input
                   type="text"
                   value={hkRoomNumber}
                   onChange={(e) => setHkRoomNumber(e.target.value)}
                   placeholder="e.g. 101"
                   className="w-full px-3 py-2 bg-hotel-cream border border-gray-150 rounded-lg text-xs focus:outline-none"
                   required
                 />
               </div>

               <div>
                 <label className="block text-gray-500 font-semibold mb-1 uppercase text-[9px] tracking-wider">Task Description</label>
                 <textarea
                   value={hkDescription}
                   onChange={(e) => setHkDescription(e.target.value)}
                   placeholder="e.g. Deep clean room, change bed sheets, replace toiletries..."
                   rows="3"
                   className="w-full px-3 py-2 bg-hotel-cream border border-gray-150 rounded-lg text-xs focus:outline-none resize-none"
                   required
                 ></textarea>
               </div>

               <div>
                 <label className="block text-gray-500 font-semibold mb-1 uppercase text-[9px] tracking-wider">Assign Housekeeper</label>
                 <select
                   value={hkAssignedStaffId}
                   onChange={(e) => setHkAssignedStaffId(e.target.value)}
                   className="w-full px-3 py-2 bg-hotel-cream border border-gray-150 rounded-lg text-xs focus:outline-none"
                 >
                   <option value="">Leave Unassigned</option>
                   {staffList
                     .filter(s => s.role.toLowerCase() === 'housekeeping')
                     .map(s => (
                       <option key={s.id} value={s.id}>{s.name}</option>
                     ))}
                 </select>
               </div>

               <button
                 type="submit"
                 disabled={submittingHk}
                 className="w-full py-2.5 bg-hotel-navy hover:bg-hotel-gold text-white hover:text-hotel-navy rounded-lg font-bold uppercase tracking-wider text-[10px] transition-luxury shadow-sm"
               >
                 {submittingHk ? 'Dispatching...' : 'Dispatch Housekeeper'}
               </button>
             </form>
           </div>

           {/* Right Side: Housekeeping Tasks Feed */}
           <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col h-[480px]">
             <div className="shrink-0 mb-3 flex justify-between items-center">
               <div>
                 <h4 className="text-xs uppercase tracking-wider font-bold text-hotel-navy flex items-center gap-1.5">
                   <Clock className="w-4.5 h-4.5 text-hotel-gold" />
                   <span>Housekeeping Tasks Feed</span>
                 </h4>
                 <p className="text-[10px] text-gray-400">Track and update housekeeping task statuses</p>
               </div>
               <button
                 onClick={fetchHousekeepingTasks}
                 className="text-[9px] font-bold text-hotel-gold hover:underline uppercase"
               >
                 Refresh Feed
               </button>
             </div>

             <div className="flex-1 overflow-y-auto space-y-3 pr-1">
               {housekeepingTasksList.length === 0 ? (
                 <div className="h-full flex items-center justify-center text-xs text-gray-400 italic">No housekeeping tasks recorded.</div>
               ) : (
                 housekeepingTasksList.map((task) => {
                   const taskStatusColors = {
                     Pending: 'bg-yellow-50 text-yellow-800 border-yellow-250',
                     'In Progress': 'bg-blue-50 text-blue-800 border-blue-200',
                     Completed: 'bg-emerald-50 text-emerald-800 border-emerald-250'
                   };
                   const statusBg = taskStatusColors[task.status] || 'bg-gray-50 text-gray-800 border-gray-200';
                   return (
                     <div key={task.id} className="bg-hotel-cream p-4 border border-gray-150 rounded-xl space-y-2 text-xs hover:shadow-sm transition-all duration-300">
                       <div className="flex justify-between items-center border-b border-gray-200/50 pb-1.5 flex-wrap gap-1">
                         <span className="font-bold text-hotel-navy">
                           Room {task.room_number}
                         </span>
                         <div className="flex items-center gap-1.5">
                           <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-extrabold rounded-md border ${statusBg}`}>
                             {task.status}
                           </span>
                           <span className="text-[10px] text-gray-400 font-medium">
                             {new Date(task.created_at).toLocaleString()}
                           </span>
                         </div>
                       </div>
                       
                       <p className="text-gray-700 leading-relaxed font-semibold">
                         {task.task_description}
                       </p>

                       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pt-1">
                         <div className="text-[10px] text-gray-500 font-medium">
                           Assigned Staff: <strong className="text-hotel-navy">{task.staff_name || 'Unassigned'}</strong>
                         </div>

                         {/* Actions */}
                         <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                           {/* Quick Assignment Dropdown if not completed */}
                           {task.status !== 'Completed' && (
                             <select
                               value={task.assigned_staff_id || ''}
                               onChange={(e) => handleUpdateHkStatus(task.id, task.status, e.target.value)}
                               className="px-2 py-1 bg-white border border-gray-250 rounded text-[9px] focus:outline-none font-bold"
                             >
                               <option value="">Assign Personnel</option>
                               {staffList
                                 .filter(s => s.role.toLowerCase() === 'housekeeping')
                                 .map(s => (
                                   <option key={s.id} value={s.id}>{s.name}</option>
                                 ))}
                             </select>
                           )}

                           {task.status === 'Pending' && (
                             <button
                               onClick={() => handleUpdateHkStatus(task.id, 'In Progress')}
                               className="px-2.5 py-1 bg-hotel-navy text-white text-[9px] font-bold uppercase rounded hover:bg-hotel-gold hover:text-hotel-navy transition-all"
                             >
                               Start
                             </button>
                           )}
                           {task.status === 'In Progress' && (
                             <button
                               onClick={() => handleUpdateHkStatus(task.id, 'Completed')}
                               className="px-2.5 py-1 bg-emerald-600 text-white text-[9px] font-bold uppercase rounded hover:bg-emerald-755 transition-all"
                             >
                               Complete
                             </button>
                           )}
                         </div>
                       </div>
                     </div>
                   );
                 })
               )}
             </div>
           </div>
         </div>
      )}

      {staffSubTab === 'enquiries' && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch animate-fade-in">
           {/* Left Side: CRM Info Box */}
           <div className="lg:col-span-1 bg-gradient-to-br from-hotel-navy to-hotel-slate border border-hotel-gold/30 rounded-xl p-5 shadow-sm text-white flex flex-col justify-between">
             <div className="space-y-3">
               <h4 className="text-sm font-serif font-bold text-hotel-gold flex items-center gap-1.5">
                 <ShieldCheck className="w-5 h-5 text-hotel-gold" />
                 <span>Enquiry Desk CRM</span>
               </h4>
               <p className="text-xs text-gray-300 leading-relaxed">
                 Guests submit enquiries regarding group bookings, early check-ins, hotel policies, or amenities. Ensure all entries receive professional and quick answers to maximize occupancy.
               </p>
             </div>

             <div className="my-6 p-4 bg-white/5 border border-white/10 rounded-xl space-y-3 text-xs">
               <div className="flex justify-between">
                 <span className="text-gray-400">Total Inbox:</span>
                 <span className="font-bold">{enquiriesList.length}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-amber-400">Pending Reply:</span>
                 <span className="font-bold text-amber-300">{enquiriesList.filter(e => e.status === 'Pending').length}</span>
               </div>
               <div className="flex justify-between">
                 <span className="text-emerald-400">Resolved/Answered:</span>
                 <span className="font-bold text-emerald-300">{enquiriesList.filter(e => e.status === 'Answered').length}</span>
               </div>
             </div>

             <div className="text-[10px] text-gray-400 italic">
               * Replying automatically updates the status to Answered and logs response details.
             </div>
           </div>

           {/* Right Side: Guest Enquiries inbox feed */}
           <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col h-[480px]">
             <div className="shrink-0 mb-3 flex justify-between items-center">
               <div>
                 <h4 className="text-xs uppercase tracking-wider font-bold text-hotel-navy flex items-center gap-1.5">
                   <Clipboard className="w-4.5 h-4.5 text-hotel-gold" />
                   <span>Guest Enquiry Feed</span>
                 </h4>
                 <p className="text-[10px] text-gray-400">Manage, reply and log customer inquiries</p>
               </div>
               <button
                 onClick={fetchEnquiries}
                 className="text-[9px] font-bold text-hotel-gold hover:underline uppercase"
               >
                 Refresh Inbox
               </button>
             </div>

             <div className="flex-1 overflow-y-auto space-y-3 pr-1">
               {enquiriesList.length === 0 ? (
                 <div className="h-full flex items-center justify-center text-xs text-gray-400 italic">No enquiries in the inbox.</div>
               ) : (
                 enquiriesList.map((enq) => {
                   const isAnswering = answeringEnquiryId === enq.id;
                   const isAnswered = enq.status === 'Answered';
                   return (
                     <div key={enq.id} className="bg-hotel-cream p-4 border border-gray-150 rounded-xl space-y-3 text-xs hover:shadow-sm transition-all duration-300">
                       <div className="flex justify-between items-center border-b border-gray-200/50 pb-1.5 flex-wrap gap-1">
                         <span className="font-bold text-hotel-navy">
                           {enq.guest_name}
                         </span>
                         <div className="flex items-center gap-2">
                           <span className={`px-2 py-0.5 text-[8px] font-extrabold uppercase rounded border ${
                             isAnswered ? 'bg-emerald-50 text-emerald-800 border-emerald-250' : 'bg-yellow-50 text-yellow-800 border-yellow-250'
                           }`}>
                             {enq.status}
                           </span>
                           <span className="text-[10px] text-gray-400 font-medium">
                             {new Date(enq.created_at).toLocaleString()}
                           </span>
                         </div>
                       </div>

                       <div className="space-y-1">
                         <div className="text-[10px] text-gray-400 font-medium">
                           Contact: <strong>{enq.email}</strong> | <strong>{enq.mobile}</strong>
                         </div>
                         <p className="text-gray-700 leading-relaxed font-semibold bg-white p-2.5 rounded-lg border border-gray-150">
                           {enq.message}
                         </p>
                       </div>

                       {isAnswering ? (
                         <div className="space-y-2 bg-yellow-50/20 p-2.5 rounded-lg border border-yellow-200/40">
                           <textarea
                             value={enquiryAnswer}
                             onChange={(e) => setEnquiryAnswer(e.target.value)}
                             placeholder="Write response notes (to send and mark as resolved)..."
                             rows="2"
                             className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-xs focus:outline-none resize-none font-medium"
                             required
                           ></textarea>
                           <div className="flex justify-end gap-1.5">
                             <button
                               onClick={() => setAnsweringEnquiryId(null)}
                               className="px-2 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-[9px] font-bold uppercase"
                             >
                               Cancel
                             </button>
                             <button
                               onClick={() => handleAnswerEnquiry(enq.id)}
                               disabled={submittingAnswer}
                               className="px-2 py-1 bg-hotel-navy text-white rounded text-[9px] font-bold uppercase hover:bg-hotel-gold hover:text-hotel-navy transition-all"
                             >
                               {submittingAnswer ? 'Sending...' : 'Send Reply'}
                             </button>
                           </div>
                         </div>
                       ) : (
                         !isAnswered && (
                           <div className="flex justify-end">
                             <button
                               onClick={() => {
                                 setAnsweringEnquiryId(enq.id);
                                 setEnquiryAnswer('');
                               }}
                               className="px-3 py-1 bg-hotel-navy hover:bg-hotel-gold text-white hover:text-hotel-navy text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all"
                             >
                               Answer Enquiry
                             </button>
                           </div>
                         )
                       )}
                     </div>
                   );
                 })
               )}
             </div>
           </div>
         </div>
      )}

      {staffSubTab === 'handovers' && (
         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch animate-fade-in">
           {/* Left Side: Create Handover Log Form */}
           <div className="lg:col-span-1 bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
             <div>
               <h4 className="text-xs uppercase tracking-wider font-bold text-hotel-navy flex items-center gap-1.5">
                 <Clipboard className="w-4.5 h-4.5 text-hotel-gold" />
                 <span>Log Shift Handover</span>
               </h4>
               <p className="text-[10px] text-gray-400">Record operational handover notes for incoming staff</p>
             </div>

             <form onSubmit={handleCreateHandover} className="space-y-4 text-xs">
               <div>
                 <label className="block text-gray-500 font-semibold mb-1 uppercase text-[9px] tracking-wider">Handover By (Outgoing)</label>
                 <input
                   type="text"
                   value={handoverBy}
                   onChange={(e) => setHandoverBy(e.target.value)}
                   placeholder="Your Name (e.g. John Doe)"
                   className="w-full px-3 py-2 bg-hotel-cream border border-gray-150 rounded-lg text-xs focus:outline-none"
                   required
                 />
               </div>

               <div>
                 <label className="block text-gray-500 font-semibold mb-1 uppercase text-[9px] tracking-wider">Handover To (Incoming)</label>
                 <select
                   value={handoverTo}
                   onChange={(e) => setHandoverTo(e.target.value)}
                   className="w-full px-3 py-2 bg-hotel-cream border border-gray-150 rounded-lg text-xs focus:outline-none"
                   required
                 >
                   <option value="">Select Staff</option>
                   {staffList.map(s => (
                     <option key={s.id} value={s.name}>{s.name} ({s.role})</option>
                   ))}
                 </select>
               </div>

               <div>
                 <label className="block text-gray-500 font-semibold mb-1 uppercase text-[9px] tracking-wider">Shift Transition</label>
                 <select
                   value={shiftType}
                   onChange={(e) => setShiftType(e.target.value)}
                   className="w-full px-3 py-2 bg-hotel-cream border border-gray-150 rounded-lg text-xs focus:outline-none"
                 >
                   <option value="Morning to Afternoon">Morning to Afternoon</option>
                   <option value="Afternoon to Night">Afternoon to Night</option>
                   <option value="Night to Morning">Night to Morning</option>
                 </select>
               </div>

               <div>
                 <label className="block text-gray-500 font-semibold mb-1 uppercase text-[9px] tracking-wider">Operational Notes</label>
                 <textarea
                   value={handoverNotes}
                   onChange={(e) => setHandoverNotes(e.target.value)}
                   placeholder="Notes on active orders, kitchen stock, or pending room requests..."
                   rows="4"
                   className="w-full px-3 py-2 bg-hotel-cream border border-gray-150 rounded-lg text-xs focus:outline-none resize-none"
                   required
                 ></textarea>
               </div>

               <button
                 type="submit"
                 disabled={submittingHandover}
                 className="w-full py-2.5 bg-hotel-navy hover:bg-hotel-gold text-white hover:text-hotel-navy rounded-lg font-bold uppercase tracking-wider text-[10px] transition-luxury shadow-sm"
               >
                 {submittingHandover ? 'Logging Handover...' : 'Log Shift Handover'}
               </button>
             </form>
           </div>

           {/* Right Side: Handovers History */}
           <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col h-[480px]">
             <div className="shrink-0 mb-3">
               <h4 className="text-xs uppercase tracking-wider font-bold text-hotel-navy flex items-center gap-1.5">
                 <Clock className="w-4.5 h-4.5 text-hotel-gold" />
                 <span>Handover Logs history</span>
               </h4>
               <p className="text-[10px] text-gray-400">Previous shift handover logs and updates</p>
             </div>

             <div className="flex-1 overflow-y-auto space-y-3 pr-1">
               {handoverList.length === 0 ? (
                 <div className="h-full flex items-center justify-center text-xs text-gray-400 italic">No handover logs recorded.</div>
               ) : (
                 handoverList.map((hand) => (
                   <div key={hand.id} className="bg-hotel-cream p-4 border border-gray-150 rounded-xl space-y-2 text-xs hover:shadow-sm transition-all duration-300">
                     <div className="flex justify-between items-center border-b border-gray-200/50 pb-1.5 flex-wrap gap-1">
                       <span className="font-bold text-hotel-navy">
                         {hand.handover_by} → {hand.handover_to}
                       </span>
                       <span className="px-2 py-0.5 bg-hotel-navy/5 text-hotel-gold text-[8px] font-extrabold uppercase border border-hotel-gold/20 rounded">
                         {hand.shift_type}
                       </span>
                       <span className="text-[10px] text-gray-400 ml-auto font-medium">
                         {new Date(hand.created_at).toLocaleString()}
                       </span>
                     </div>
                     <p className="text-gray-600 leading-relaxed italic">
                       "{hand.notes}"
                     </p>
                   </div>
                 ))
               )}
             </div>
           </div>
         </div>
      )}
    </div>
  );
}
