import React, { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle2, Clock, Truck, ShieldCheck, Ban, AlertCircle, RefreshCw } from 'lucide-react';

const STATUS_STEPS = [
  { id: 'Pending', label: 'Pending', icon: Clock, desc: 'Received by Front Desk' },
  { id: 'Accepted', label: 'Accepted', icon: ShieldCheck, desc: 'Staff Assigned' },
  { id: 'Preparing', label: 'Preparing', icon: Loader2, desc: 'Service In Progress' },
  { id: 'Out for Delivery', label: 'Out for Delivery', icon: Truck, desc: 'Staff on the Way' },
  { id: 'Delivered', label: 'Delivered', icon: CheckCircle2, desc: 'Arrived at Room' },
  { id: 'Closed', label: 'Closed', icon: CheckCircle2, desc: 'Order Fulfilled' }
];

export default function OrderTimeline({ defaultOrderId }) {
  const [orderIdInput, setOrderIdInput] = useState(defaultOrderId || '');
  const [activeOrderId, setActiveOrderId] = useState(defaultOrderId || null);
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Feedback states
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Sync with defaultOrderId props
  useEffect(() => {
    if (defaultOrderId) {
      setOrderIdInput(defaultOrderId);
      setActiveOrderId(defaultOrderId);
    }
  }, [defaultOrderId]);

  // Reset feedback state on order change
  useEffect(() => {
    setFeedbackSubmitted(false);
    setRating(5);
    setComments('');
  }, [activeOrderId]);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setSubmittingFeedback(true);
    try {
      const response = await fetch(`http://localhost:5001/orders/${activeOrderId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comments })
      });
      if (response.ok) {
        setFeedbackSubmitted(true);
      } else {
        const resData = await response.json();
        alert(resData.error || "Failed to submit feedback.");
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const fetchOrderDetails = async (id) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5001/orders/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Order #${id} not found.`);
        }
        throw new Error("Failed to fetch order details.");
      }
      const data = await response.json();
      setOrderData(data);
    } catch (err) {
      setError(err.message);
      setOrderData(null);
    } finally {
      setLoading(false);
    }
  };

  // Poll details every 10 seconds if autoRefresh is active
  useEffect(() => {
    if (activeOrderId) {
      fetchOrderDetails(activeOrderId);
    }

    if (!autoRefresh || !activeOrderId) return;

    const interval = setInterval(() => {
      fetchOrderDetails(activeOrderId);
    }, 10000);

    return () => clearInterval(interval);
  }, [activeOrderId, autoRefresh]);

  const handleSearch = (e) => {
    e.preventDefault();
    const id = parseInt(orderIdInput);
    if (isNaN(id)) {
      setError("Please enter a valid numeric Order ID");
      return;
    }
    setActiveOrderId(id);
  };

  const getStepStatusClass = (stepId) => {
    if (!orderData) return 'text-gray-300 border-gray-200 bg-white';
    
    const currentStatus = orderData.status;
    if (currentStatus === 'Cancelled') {
      return 'text-red-300 border-red-200 bg-red-50';
    }

    const currentIdx = STATUS_STEPS.findIndex(s => s.id === currentStatus);
    const stepIdx = STATUS_STEPS.findIndex(s => s.id === stepId);

    if (stepIdx < 0) return 'text-gray-300 border-gray-200 bg-white';

    if (stepIdx < currentIdx) {
      // Completed steps
      return 'text-amber-600 border-hotel-gold bg-amber-50';
    } else if (stepIdx === currentIdx) {
      // Active step
      return 'text-white border-hotel-gold bg-gradient-to-r from-hotel-navy to-hotel-slate ring-4 ring-yellow-500/10 scale-110';
    } else {
      // Future steps
      return 'text-gray-400 border-gray-200 bg-white';
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white border border-hotel-gold/20 rounded-2xl p-6 shadow-md animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center border-b border-gray-150 pb-4 mb-6 gap-3">
        <div>
          <h4 className="text-xl font-serif font-bold text-hotel-navy">Track Your Order</h4>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest">Real-time status timeline</p>
        </div>
        
        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex w-full sm:w-auto items-center gap-2">
          <input
            type="text"
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
            placeholder="Enter Order ID (e.g. 1)"
            className="w-full sm:w-44 px-3 py-1.5 bg-hotel-cream border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-hotel-navy text-white hover:bg-hotel-gold hover:text-hotel-navy rounded-lg text-xs uppercase tracking-wider font-semibold border border-hotel-gold/20 transition-luxury flex items-center gap-1"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Track</span>
          </button>
        </form>
      </div>

      {loading && !orderData && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-hotel-gold animate-spin mb-2" />
          <p className="text-xs text-gray-500 uppercase tracking-widest">Loading order status...</p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl text-xs mb-6">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {orderData ? (
        <div className="space-y-8 animate-fade-in">
          {/* Order Brief Info */}
          <div className="bg-hotel-cream p-4 rounded-xl border border-gray-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-gray-400 font-semibold uppercase text-[9px] tracking-wider mb-0.5">Order ID / Room</p>
              <p className="font-bold text-hotel-navy">#{orderData.id} / Room {orderData.room_number}</p>
            </div>
            <div>
              <p className="text-gray-400 font-semibold uppercase text-[9px] tracking-wider mb-0.5">Guest Name</p>
              <p className="font-bold text-hotel-navy">{orderData.guest_name}</p>
            </div>
            <div>
              <p className="text-gray-400 font-semibold uppercase text-[9px] tracking-wider mb-0.5">Service Detail</p>
              <p className="font-bold text-hotel-navy truncate">{orderData.item_detail} (x{orderData.quantity})</p>
            </div>
            <div className="flex items-center justify-between sm:justify-start gap-2">
              <div>
                <p className="text-gray-400 font-semibold uppercase text-[9px] tracking-wider mb-0.5">Assigned Staff</p>
                <p className="font-bold text-hotel-navy">{orderData.staff_name || 'Finding Staff...'}</p>
              </div>
              <button
                onClick={() => fetchOrderDetails(activeOrderId)}
                title="Refresh Status"
                className="ml-auto p-1 text-hotel-navy hover:text-hotel-gold hover:rotate-180 transition-all duration-500"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Timeline View */}
          {orderData.status === 'Cancelled' ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-center gap-4 text-red-800">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 border border-red-200 shrink-0">
                <Ban className="w-6 h-6" />
              </div>
              <div>
                <h5 className="font-serif font-bold text-base">Order Cancelled</h5>
                <p className="text-xs text-red-600/80 mt-0.5">
                  {orderData.history && orderData.history[0]?.notes 
                    ? `Reason: ${orderData.history[0].notes}` 
                    : 'This room service request has been cancelled. No further actions will be taken.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative pt-4 pb-6">
              {/* Horizontal Line for Desktops */}
              <div className="absolute top-10 left-12 right-12 h-0.5 bg-gray-150 -z-10 hidden md:block"></div>
              
              {/* Timeline list */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-6 md:gap-0">
                {STATUS_STEPS.map((step, idx) => {
                  const StepIcon = step.icon;
                  const isCurrent = orderData.status === step.id;
                  
                  return (
                    <div key={step.id} className="flex md:flex-col items-center md:text-center w-full md:w-32 group">
                      {/* Step Bubble */}
                      <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 shrink-0 z-10 ${getStepStatusClass(step.id)}`}>
                        {isCurrent && step.id === 'Preparing' ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <StepIcon className="w-5 h-5" />
                        )}
                      </div>
                      
                      {/* Step Text Info */}
                      <div className="ml-4 md:ml-0 md:mt-3 text-left md:text-center">
                        <p className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-hotel-navy font-extrabold' : 'text-gray-500'}`}>
                          {step.label}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{step.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Guest Feedback Section */}
          {(orderData.status === 'Delivered' || orderData.status === 'Closed') && (
            <div className="border-t border-gray-150 pt-5 mt-5">
              {feedbackSubmitted ? (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-center text-xs">
                  <p className="font-bold text-sm">Thank You!</p>
                  <p className="mt-1">Your feedback has been recorded. Enjoy your stay at Sri Nirvana Plaza!</p>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="bg-hotel-cream p-4 rounded-xl border border-gray-200 space-y-3 animate-fade-in">
                  <h5 className="text-xs uppercase tracking-wider font-bold text-hotel-navy">Rate Your Service Experience</h5>
                  <p className="text-[10px] text-gray-400">Your feedback helps us maintain Sri Nirvana Plaza's elite standards.</p>
                  
                  {/* Rating stars */}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-0.5 text-yellow-500 hover:scale-110 transition-transform"
                      >
                        {star <= rating ? (
                          <span className="text-xl">★</span>
                        ) : (
                          <span className="text-xl">☆</span>
                        )}
                      </button>
                    ))}
                    <span className="text-xs text-gray-500 ml-2 font-semibold">{rating} / 5 Stars</span>
                  </div>
                  
                  {/* Comments input */}
                  <textarea
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Write comments/suggestions (optional)..."
                    className="w-full p-2.5 bg-white border border-gray-150 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-hotel-gold h-16"
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingFeedback}
                      className="px-3 py-1.5 bg-hotel-navy text-white hover:bg-hotel-gold hover:text-hotel-navy rounded-lg text-xs uppercase tracking-wider font-bold transition-luxury"
                    >
                      {submittingFeedback ? 'Submitting...' : 'Submit Feedback'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Activity logs audit trail */}
          {orderData.history && orderData.history.length > 0 && (
            <div className="border-t border-gray-150 pt-5">
              <h5 className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-3.5">
                Service Activity Logs
              </h5>
              <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
                {orderData.history.map((log) => (
                  <div key={log.id} className="flex gap-3 text-xs border-b border-gray-50 pb-2">
                    <span className="text-gray-400 shrink-0 font-medium">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <div className="grow">
                      <span className="font-bold text-hotel-navy mr-1.5">{log.changed_by}</span>
                      <span className="text-gray-600">{log.notes}</span>
                    </div>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] uppercase tracking-wide border border-gray-200">
                      {log.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        !loading && (
          <div className="text-center py-10 bg-hotel-cream rounded-xl border border-dashed border-gray-200">
            <Clock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold">No Order Selected</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Enter your Order ID above or place a new request to track status.
            </p>
          </div>
        )
      )}
    </div>
  );
}
