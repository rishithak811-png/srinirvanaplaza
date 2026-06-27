import React, { useState, useEffect } from 'react';
import { Utensils, Sparkles, Shirt, Wrench, HelpCircle, Send, CheckCircle, AlertTriangle } from 'lucide-react';

const CATEGORIES = [
  { id: 'Food', label: 'Food & Dining', icon: Utensils, color: 'text-amber-500 bg-amber-50 border-amber-200' },
  { id: 'Housekeeping', label: 'Housekeeping', icon: Sparkles, color: 'text-emerald-500 bg-emerald-50 border-emerald-200' },
  { id: 'Laundry', label: 'Laundry Service', icon: Shirt, color: 'text-blue-500 bg-blue-50 border-blue-200' },
  { id: 'Maintenance', label: 'Maintenance', icon: Wrench, color: 'text-rose-500 bg-rose-50 border-rose-200' },
  { id: 'Other', label: 'Other Services', icon: HelpCircle, color: 'text-purple-500 bg-purple-50 border-purple-200' }
];

const ITEM_SUGGESTIONS = {
  Food: ['Club Sandwich & Fries', 'Marinated Chicken Biryani', 'Premium Fruit Platter', 'Tomato Basil Soup', 'Fresh Orange Juice', 'Hot Tea & Biscuits'],
  Housekeeping: ['Fresh Bath Towels', 'Extra Feathery Pillows', 'Shaving Kit & Toothbrush', 'Bottled Mineral Water', 'Extra Bed Sheets'],
  Laundry: ['Express Shirt Pressing', 'Suit Dry Cleaning', 'Regular Coat Washing'],
  Maintenance: ['A/C Unit Cooling Issue', 'TV Remote Batteries', 'Bathroom Light Bulb Replacement', 'Safe Locker Battery Reset'],
  Other: ['Morning Newspaper', 'Taxi Booking Request', 'Wake-up Call Setup']
};

export default function GuestForm({ onSubmitSuccess }) {
  const [formData, setFormData] = useState({
    guestName: '',
    roomNumber: '',
    mobileNumber: '',
    category: 'Food',
    itemDetail: '',
    quantity: 1,
    specialInstructions: '',
    priority: 'Medium'
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successOrder, setSuccessOrder] = useState(null);

  // Auto-fill item detail when category changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      itemDetail: ITEM_SUGGESTIONS[prev.category][0] || ''
    }));
  }, [formData.category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleCategorySelect = (catId) => {
    setFormData(prev => ({ ...prev, category: catId }));
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.guestName.trim()) newErrors.guestName = "Guest name is required";
    
    if (!formData.roomNumber.trim()) {
      newErrors.roomNumber = "Room number is required";
    } else if (!/^\d+$/.test(formData.roomNumber.trim())) {
      newErrors.roomNumber = "Room number must contain digits only";
    }
    
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!/^\+?[\d-\s]{8,15}$/.test(formData.mobileNumber.trim())) {
      newErrors.mobileNumber = "Enter a valid mobile number (8-15 digits)";
    }
    
    if (!formData.itemDetail.trim()) newErrors.itemDetail = "Item description is required";
    
    if (formData.quantity <= 0) newErrors.quantity = "Quantity must be greater than 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setSubmitError(null);

    try {
      const response = await fetch('http://localhost:5001/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to submit request");
      }

      setSuccessOrder({
        id: result.orderId,
        itemDetail: formData.itemDetail,
        quantity: formData.quantity,
        roomNumber: formData.roomNumber
      });

      // Reset form
      setFormData(prev => ({
        ...prev,
        specialInstructions: ''
      }));

    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (successOrder) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl border border-hotel-gold/30 p-8 text-center shadow-lg animate-fade-in my-8">
        <div className="w-16 h-16 bg-yellow-50 text-hotel-gold border border-hotel-gold/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-hotel-navy mb-2">Request Placed Successfully</h3>
        <p className="text-xs text-gray-500 tracking-wider uppercase mb-6">SRI NIRVANA PLAZA</p>
        
        <div className="bg-hotel-cream p-4 rounded-xl border border-gray-150 text-left mb-6 text-sm">
          <div className="flex justify-between py-1 border-b border-gray-200">
            <span className="text-gray-400 font-semibold uppercase text-[10px]">Order ID</span>
            <span className="font-bold text-hotel-navy">#{successOrder.id}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-200">
            <span className="text-gray-400 font-semibold uppercase text-[10px]">Room Number</span>
            <span className="font-bold text-hotel-navy">{successOrder.roomNumber}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-400 font-semibold uppercase text-[10px]">Service Requested</span>
            <span className="font-bold text-hotel-navy">{successOrder.itemDetail} (x{successOrder.quantity})</span>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-6">
          Our staff has been notified. You can track this request status in real-time.
        </p>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => onSubmitSuccess && onSubmitSuccess(successOrder.id)}
            className="w-full py-3 bg-gradient-to-r from-hotel-navy to-hotel-slate hover:from-hotel-gold hover:to-hotel-goldDark text-white hover:text-hotel-navy rounded-xl text-xs uppercase tracking-widest font-bold border border-hotel-gold/30 shadow-md transition-all duration-300"
          >
            Track Order Status
          </button>
          <button
            onClick={() => setSuccessOrder(null)}
            className="w-full py-3 bg-white hover:bg-gray-100 text-gray-700 rounded-xl text-xs uppercase tracking-widest font-bold border border-gray-200 transition-all duration-300"
          >
            Place Another Request
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-hotel-gold/20 p-6 md:p-8 shadow-md animate-fade-in">
      <div className="text-center mb-8">
        <h3 className="text-2xl md:text-3xl font-serif font-bold text-hotel-navy">Room Service Request Form</h3>
        <p className="text-xs text-hotel-gold tracking-widest uppercase mt-1">Sri Nirvana Plaza</p>
        <div className="w-16 h-0.5 bg-hotel-gold mx-auto mt-3"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {submitError && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

        {/* 1. Guest Information Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5">
              Guest Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="guestName"
              value={formData.guestName}
              onChange={handleChange}
              placeholder="e.g. Rahul Sharma"
              className={`w-full px-4 py-2.5 bg-hotel-cream border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold ${
                errors.guestName ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.guestName && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.guestName}</p>}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5">
              Room Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleChange}
              placeholder="e.g. 101"
              className={`w-full px-4 py-2.5 bg-hotel-cream border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold ${
                errors.roomNumber ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.roomNumber && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.roomNumber}</p>}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="mobileNumber"
              value={formData.mobileNumber}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
              className={`w-full px-4 py-2.5 bg-hotel-cream border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold ${
                errors.mobileNumber ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.mobileNumber && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.mobileNumber}</p>}
          </div>
        </div>

        {/* 2. Service Category Picker */}
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2.5">
            Select Order Category <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = formData.category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-luxury ${
                    isSelected 
                      ? 'border-hotel-gold bg-gradient-to-b from-yellow-50 to-white text-yellow-700 shadow-sm scale-102 font-semibold' 
                      : 'border-gray-100 bg-hotel-cream text-gray-500 hover:border-gray-200 hover:text-hotel-navy'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-[10px] uppercase tracking-wide leading-tight">{cat.id}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Order Priority Selector */}
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-2.5">
            Order Priority <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'Low', label: 'Low', color: 'border-slate-200 text-slate-700 bg-slate-50' },
              { id: 'Medium', label: 'Medium', color: 'border-blue-200 text-blue-700 bg-blue-50' },
              { id: 'High', label: 'High', color: 'border-orange-200 text-orange-700 bg-orange-50' },
              { id: 'Urgent', label: 'Urgent', color: 'border-red-200 text-red-700 bg-red-50' }
            ].map((prio) => {
              const isSelected = formData.priority === prio.id;
              let selectedStyle = '';
              if (isSelected) {
                if (prio.id === 'Low') selectedStyle = 'bg-slate-500 text-white border-slate-500 font-bold';
                else if (prio.id === 'Medium') selectedStyle = 'bg-blue-600 text-white border-blue-600 font-bold';
                else if (prio.id === 'High') selectedStyle = 'bg-orange-500 text-white border-orange-500 font-bold';
                else if (prio.id === 'Urgent') selectedStyle = 'bg-red-600 text-white border-red-600 font-bold ring-2 ring-red-200 animate-pulse';
              }
              return (
                <button
                  key={prio.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: prio.id }))}
                  className={`py-2 px-3 border rounded-xl text-center text-[11px] uppercase tracking-wider transition-luxury font-bold ${
                    isSelected ? selectedStyle : `${prio.color} hover:opacity-85`
                  }`}
                >
                  {prio.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Item Selection & Quantity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5">
              Item / Service Selection <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-col gap-2">
              <select
                name="itemDetail"
                value={formData.itemDetail}
                onChange={handleChange}
                className="w-full px-4 py-2.5 bg-hotel-cream border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
              >
                {(ITEM_SUGGESTIONS[formData.category] || []).map((item, idx) => (
                  <option key={idx} value={item}>{item}</option>
                ))}
                <option value="custom">-- Request Custom Item --</option>
              </select>
              
              {/* Custom Item Input */}
              {formData.itemDetail === 'custom' || !ITEM_SUGGESTIONS[formData.category].includes(formData.itemDetail) ? (
                <input
                  type="text"
                  name="itemDetail"
                  value={formData.itemDetail === 'custom' ? '' : formData.itemDetail}
                  onChange={handleChange}
                  placeholder="Enter specific item details..."
                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold"
                />
              ) : null}
            </div>
            {errors.itemDetail && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.itemDetail}</p>}
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5">
              Quantity <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, quantity: Math.max(1, prev.quantity - 1) }))}
                className="w-10 py-2.5 bg-gray-150 border border-gray-200 border-r-0 rounded-l-xl text-gray-600 hover:bg-gray-200 text-sm font-bold"
              >
                -
              </button>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                className="w-full text-center py-2.5 border-y border-gray-200 text-sm focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, quantity: prev.quantity + 1 }))}
                className="w-10 py-2.5 bg-gray-150 border border-gray-200 border-l-0 rounded-r-xl text-gray-600 hover:bg-gray-200 text-sm font-bold"
              >
                +
              </button>
            </div>
            {errors.quantity && <p className="text-[10px] text-red-500 mt-1 font-medium">{errors.quantity}</p>}
          </div>
        </div>

        {/* 4. Special Instructions */}
        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1.5">
            Special Instructions / Notes
          </label>
          <textarea
            name="specialInstructions"
            value={formData.specialInstructions}
            onChange={handleChange}
            rows="3"
            placeholder="e.g. Extra ketchup, clean towels before 2 PM, safe locker reset needed, etc."
            className="w-full px-4 py-2.5 bg-hotel-cream border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-hotel-gold resize-none"
          ></textarea>
        </div>

        {/* 5. Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-hotel-navy via-hotel-slate to-hotel-navyDark text-white hover:from-hotel-gold hover:to-hotel-goldDark hover:text-hotel-navy rounded-xl text-xs uppercase tracking-widest font-bold border border-hotel-gold/30 shadow-lg shadow-gray-200/50 hover:shadow-yellow-500/15 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
        >
          {loading ? (
            <span>Submitting Request...</span>
          ) : (
            <>
              <Send className="w-3.5 h-3.5" />
              <span>Submit Room Service Request</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
