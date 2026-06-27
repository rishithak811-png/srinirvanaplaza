import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, BarChart3, TrendingUp, History, Clock, FileSpreadsheet, AlertCircle, LayoutGrid, Plus, Info, CheckCircle2 } from 'lucide-react';

export default function AdminDashboard() {
  const [reportData, setReportData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [roomsData, setRoomsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Active Manager Tab: 'kpi' | 'rooms' | 'charts' | 'audits'
  const [managerTab, setManagerTab] = useState('kpi');
  
  // Selected Room for Inspector Details
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Booking Form States
  const [bkGuestName, setBkGuestName] = useState('');
  const [bkMobileNumber, setBkMobileNumber] = useState('');
  const [bkRoomType, setBkRoomType] = useState('Standard Room');
  const [bkBookingStatus, setBkBookingStatus] = useState('CheckedIn');
  const [bkCheckInDate, setBkCheckInDate] = useState(new Date().toISOString().split('T')[0]);
  const [bkCheckOutDate, setBkCheckOutDate] = useState(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [bkLoyaltyPreference, setBkLoyaltyPreference] = useState('');
  const [bkLoading, setBkLoading] = useState(false);

  const generateInvoice = (order) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    const quantity = order.Quantity || 1;
    const pricePerUnit = order.Category === 'Food' ? 350 : order.Category === 'Laundry' ? 120 : order.Category === 'Housekeeping' ? 0 : 250;
    const subtotal = quantity * pricePerUnit;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + tax;

    const htmlContent = `
      <html>
        <head>
          <title>Room Service Invoice #${order.OrderID}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; }
            .invoice-box { max-width: 800px; margin: auto; border: 1px solid #e2e8f0; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #c5a880; padding-bottom: 15px; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; color: #1e293b; font-family: Georgia, serif; }
            .hotel-info { text-align: right; font-size: 11px; color: #64748b; line-height: 1.4; }
            .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
            .details-table th, .details-table td { border-bottom: 1px solid #f1f5f9; padding: 10px; text-align: left; }
            .details-table th { background-color: #f8fafc; font-weight: 600; color: #475569; }
            .total-section { display: flex; justify-content: flex-end; font-size: 14px; font-weight: bold; margin-top: 20px; }
            .total-box { border-top: 2px solid #e2e8f0; padding-top: 10px; width: 250px; text-align: right; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="invoice-box">
            <div class="header">
              <div>
                <div class="title">SRI NIRVANA PLAZA</div>
                <div style="font-size: 9px; color: #c5a880; font-weight: bold; letter-spacing: 2px; text-transform: uppercase;">Luxury Business Suites</div>
              </div>
              <div class="hotel-info">
                <strong>INVOICE RECEIPT</strong><br/>
                Invoice ID: #INV-${order.OrderID}<br/>
                Date: ${new Date().toLocaleDateString()}<br/>
                Room: ${order.RoomNumber}
              </div>
            </div>
            <table class="details-table">
              <thead><tr><th>Description</th><th>Quantity</th><th>Price</th><th>Amount</th></tr></thead>
              <tbody>
                <tr>
                  <td>${order.ItemDetail}</td>
                  <td>${quantity}</td>
                  <td>₹${pricePerUnit}.00</td>
                  <td>₹${subtotal}.00</td>
                </tr>
              </tbody>
            </table>
            <div class="total-section">
              <div class="total-box">
                <div>Subtotal: ₹${subtotal}.00</div>
                <div>CGST & SGST (18%): ₹${tax}.00</div>
                <div style="font-size: 15px; border-top: 1px solid #e2e8f0; margin-top: 6px; padding-top: 6px;">Total: ₹${total}.00</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const statsRes = await fetch('http://localhost:5001/dashboard/stats');
      const stats = await statsRes.json();
      setStatsData(stats);

      const reportRes = await fetch('http://localhost:5001/dashboard/reports');
      const reports = await reportRes.json();
      setReportData(reports);

      const roomsRes = await fetch('http://localhost:5001/dashboard/rooms');
      const roomsObj = await roomsRes.json();
      setRoomsData(roomsObj);

      if (selectedRoom) {
        const updated = roomsObj.rooms.find(r => r.roomNumber === selectedRoom.roomNumber);
        if (updated) setSelectedRoom(updated);
      }
    } catch (err) {
      setError("Failed to load dashboard metrics: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleBookRoom = async (e) => {
    e.preventDefault();
    if (!selectedRoom || !bkGuestName || !bkMobileNumber) return;
    
    setBkLoading(true);
    try {
      const response = await fetch('http://localhost:5001/dashboard/rooms/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomNumber: selectedRoom.roomNumber,
          guestName: bkGuestName,
          mobileNumber: bkMobileNumber,
          roomType: bkRoomType,
          checkInDate: bkCheckInDate,
          checkOutDate: bkCheckOutDate,
          bookingStatus: bkBookingStatus,
          seasonalRate: bkRoomType === 'Standard Room' ? 3500 : bkRoomType === 'Deluxe Room' ? 5500 : bkRoomType === 'Executive Suite' ? 8500 : 12000,
          loyaltyPreference: bkLoyaltyPreference
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Check-in failed");

      setBkGuestName('');
      setBkMobileNumber('');
      setBkLoyaltyPreference('');
      
      await fetchDashboardData();
      alert(`Guest successfully checked into Room ${selectedRoom.roomNumber}!`);
    } catch (err) {
      alert(err.message);
    } finally {
      setBkLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!reportData || !reportData.exportData || reportData.exportData.length === 0) {
      alert("No data available for export.");
      return;
    }
    const headers = ["Order ID", "Guest Name", "Room Number", "Category", "Item Detail", "Quantity", "Status", "Assigned Staff", "Created At", "Last Updated"];
    const rows = reportData.exportData.map(o => [o.OrderID, `"${o.GuestName}"`, o.RoomNumber, o.Category, `"${o.ItemDetail.replace(/"/g, '""')}"`, o.Quantity, o.Status, `"${o.AssignedStaff}"`, `"${o.CreatedAt}"`, `"${o.LastUpdated}"`]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sri_nirvana_plaza_orders_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !statsData) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center">
        <RefreshCw className="w-10 h-10 text-hotel-gold animate-spin mx-auto mb-2" />
        <p className="text-xs text-gray-500 uppercase tracking-widest">Loading manager metrics...</p>
      </div>
    );
  }

  const s = statsData?.stats || { Total: 0, Pending: 0, Preparing: 0, Accepted: 0, 'Out for Delivery': 0, Delivered: 0, Closed: 0, Cancelled: 0, InProgress: 0 };
  const categories = statsData?.categories || { Food: 0, Housekeeping: 0, Laundry: 0, Maintenance: 0, Other: 0 };
  const avgTime = reportData?.avgFulfillmentMinutes || 0;
  const recentLogs = reportData?.recentLogs || [];
  const maxCategoryCount = Math.max(...Object.values(categories), 1);
  const categoryKeys = Object.keys(categories);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-150 pb-4">
        <div>
          <h3 className="text-2xl font-serif font-bold text-hotel-navy">Manager Analytics Board</h3>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Sri Nirvana Plaza Executive Suite</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={fetchDashboardData}
            className="p-2 border border-gray-200 bg-white rounded-lg text-gray-500 hover:text-hotel-gold hover:border-hotel-gold/30 flex items-center justify-center transition-all duration-300"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl text-xs">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex justify-center border-b border-hotel-gold/20 max-w-lg mx-auto mb-6 flex-wrap">
        {[
          { id: 'kpi', label: 'KPI Summary', icon: Clock },
          { id: 'rooms', label: 'Rooms & Bookings', icon: LayoutGrid },
          { id: 'charts', label: 'Performance Charts', icon: BarChart3 },
          { id: 'audits', label: 'Activity & Reports', icon: History }
        ].map((tab) => {
          const TabIcon = tab.icon;
          const isActive = managerTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setManagerTab(tab.id)}
              className={`flex items-center gap-2 px-4 md:px-6 py-3 border-b-2 text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                isActive ? 'border-hotel-gold text-hotel-navy font-bold' : 'border-transparent text-gray-500 hover:text-hotel-navy'
              }`}
            >
              <TabIcon className="w-4 h-4" />
              <span>{tab.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      <div className="max-w-6xl mx-auto">
        {managerTab === 'kpi' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="bg-gradient-to-br from-hotel-navy to-hotel-slate text-white border border-hotel-gold/20 rounded-xl p-5 shadow-sm text-center">
                <div className="text-[10px] uppercase tracking-wider font-semibold opacity-70">Total Requests</div>
                <div className="text-2xl md:text-3xl font-serif font-bold mt-2 text-hotel-gold">{s.Total}</div>
              </div>
              <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm text-center">
                <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Avg Fulfillment</div>
                <div className="text-2xl md:text-3xl font-serif font-bold mt-2 text-amber-700">{avgTime} Min</div>
                <p className="text-[9px] text-gray-400 mt-1 font-medium">Average SLA time</p>
              </div>
              <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm text-center">
                <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Active Queue</div>
                <div className="text-2xl md:text-3xl font-serif font-bold mt-2 text-indigo-600">{s.InProgress}</div>
                <p className="text-[9px] text-gray-400 mt-1 font-medium">In progress</p>
              </div>
              <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm text-center">
                <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Pending Assign</div>
                <div className="text-2xl md:text-3xl font-serif font-bold mt-2 text-yellow-600">{s.Pending}</div>
                <p className="text-[9px] text-gray-400 mt-1 font-medium">Needs assignment</p>
              </div>
              <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm text-center">
                <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Occupancy Rate</div>
                <div className="text-2xl md:text-3xl font-serif font-bold mt-2 text-emerald-700">{statsData?.occupancy?.rate || 0}%</div>
                <p className="text-[9px] text-gray-400 mt-1 font-medium">{statsData?.occupancy?.occupied || 0} / 50 rooms</p>
              </div>
              <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm text-center">
                <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400">Guest Ratings</div>
                <div className="text-2xl md:text-3xl font-serif font-bold mt-2 text-hotel-gold">★ {statsData?.feedback?.avgRating || '0.0'}</div>
                <p className="text-[9px] text-gray-400 mt-1 font-medium">From {statsData?.feedback?.count || 0} reviews</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold">
              <div className="bg-emerald-50/50 border border-emerald-150 rounded-xl p-4 flex justify-between items-center text-emerald-800">
                <div><h4 className="font-bold">Delivered Orders</h4></div>
                <div className="text-3xl font-serif font-bold">{s.Delivered}</div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center text-gray-700">
                <div><h4 className="font-bold">Closed orders</h4></div>
                <div className="text-3xl font-serif font-bold">{s.Closed}</div>
              </div>
              <div className="bg-red-50/50 border border-red-150 rounded-xl p-4 flex justify-between items-center text-red-800">
                <div><h4 className="font-bold">Cancelled orders</h4></div>
                <div className="text-3xl font-serif font-bold">{s.Cancelled}</div>
              </div>
            </div>
          </div>
        )}

        {managerTab === 'rooms' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
            <div className="lg:col-span-2 bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3 flex-wrap gap-2">
                <div>
                  <h4 className="text-sm uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1.5">
                    <LayoutGrid className="w-4 h-4 text-hotel-gold" />
                    <span>Visual Room Inventory Map</span>
                  </h4>
                  <p className="text-[10px] text-gray-400 font-medium">Interactive grid of all 50 rooms organized by floor</p>
                </div>
                <div className="flex gap-2 flex-wrap text-[9px] font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Available</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-red-500"></span> Occupied</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-500"></span> Reserved</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-purple-500"></span> Dirty</span>
                </div>
              </div>
              <div className="space-y-6 max-h-[460px] overflow-y-auto pr-1">
                {[5, 4, 3, 2, 1].map(floor => {
                  const floorRooms = roomsData?.rooms?.filter(r => r.floor === floor) || [];
                  return (
                    <div key={floor} className="space-y-2">
                      <div className="text-[10px] uppercase tracking-widest font-extrabold text-gray-400 border-b border-gray-100 pb-1">Floor {floor}</div>
                      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                        {floorRooms.map(room => {
                          let bgClass = 'bg-emerald-500 text-white';
                          if (room.status === 'Occupied') bgClass = 'bg-red-500 text-white';
                          else if (room.status === 'Reserved') bgClass = 'bg-amber-500 text-white';
                          else if (room.status === 'Dirty') bgClass = 'bg-purple-500 text-white';
                          const isSelected = selectedRoom?.roomNumber === room.roomNumber;
                          return (
                            <button key={room.roomNumber} onClick={() => setSelectedRoom(room)} className={`h-11 rounded-lg text-xs font-bold transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center shadow-xs ${bgClass} ${isSelected ? 'ring-4 ring-hotel-navy/55 scale-105' : 'hover:opacity-90'}`}>
                              <span>{room.roomNumber}</span>
                              {room.booking && <span className="text-[7px] opacity-75 font-normal truncate max-w-[90%]">{room.booking.guestName.split(' ')[0]}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              {selectedRoom ? (
                <div className="bg-white border border-gray-150 rounded-2xl p-5 shadow-sm space-y-4 animate-fade-in">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                    <h4 className="font-serif font-bold text-hotel-navy text-sm">Room {selectedRoom.roomNumber} Detail</h4>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${selectedRoom.status === 'Available' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{selectedRoom.status}</span>
                  </div>
                  {selectedRoom.booking ? (
                    <div className="space-y-3 text-xs">
                      <div className="bg-hotel-cream p-3 rounded-xl border border-gray-150/70 space-y-1.5 font-medium">
                        <div className="font-bold text-hotel-navy uppercase text-[9px] tracking-widest text-gray-400">Active Guest</div>
                        <div>Name: {selectedRoom.booking.guestName}</div>
                        <div>Room Type: {selectedRoom.booking.roomType}</div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleBookRoom} className="space-y-2 text-xs font-medium">
                      <input type="text" required value={bkGuestName} onChange={(e) => setBkGuestName(e.target.value)} placeholder="Guest Name" className="w-full px-2.5 py-1.5 bg-hotel-cream border rounded-lg" />
                      <input type="text" required value={bkMobileNumber} onChange={(e) => setBkMobileNumber(e.target.value)} placeholder="Mobile Number" className="w-full px-2.5 py-1.5 bg-hotel-cream border rounded-lg" />
                      <button type="submit" className="w-full py-2 bg-hotel-navy hover:bg-hotel-gold text-white rounded-xl uppercase font-bold text-[10px]">Confirm Check-In</button>
                    </form>
                  )}
                </div>
              ) : (
                <div className="bg-white border border-gray-150 rounded-2xl p-6 text-center text-xs text-gray-400">
                  <Info className="w-8 h-8 text-hotel-gold/50 mx-auto" />
                  <p className="mt-2 font-bold uppercase tracking-wider text-hotel-navy">Room Inspector</p>
                </div>
              )}
            </div>

            <div className="lg:col-span-3 bg-white border border-gray-150 rounded-2xl p-5 shadow-sm">
              <h4 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-3">Active Reservations Registry</h4>
              <table className="w-full text-xs">
                <thead><tr className="bg-hotel-cream uppercase text-[9px] text-left"><th className="p-2.5">Room</th><th className="p-2.5">Guest</th><th className="p-2.5">Dates</th></tr></thead>
                <tbody>{roomsData?.bookings?.map(b => (
                  <tr key={b.id} className="border-b">
                    <td className="p-2.5 font-bold">Room {b.room_number}</td>
                    <td className="p-2.5">{b.guest_name}</td>
                    <td className="p-2.5">{b.check_in_date} to {b.check_out_date}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </div>
        )}

        {managerTab === 'charts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div className="bg-white border border-gray-150 rounded-xl p-6 shadow-sm space-y-4">
              <h4 className="text-sm uppercase tracking-wider font-bold text-gray-400 flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-hotel-gold"/> Category Breakdown</h4>
              {categoryKeys.map((catKey) => (
                <div key={catKey} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold"><span>{catKey}</span><span>{categories[catKey]}</span></div>
                  <div className="w-full bg-gray-150 h-2.5 rounded-full"><div className="bg-hotel-gold h-full rounded-full" style={{ width: `${(categories[catKey] / maxCategoryCount) * 100}%` }}></div></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {managerTab === 'audits' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start animate-fade-in">
            <div className="space-y-6">
              <div className="bg-white border border-gray-150 rounded-xl p-5 shadow-sm">
                <h4 className="text-xs uppercase tracking-wider font-bold text-gray-400">Export Report Suite</h4>
                <button onClick={handleExportCSV} className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 bg-hotel-navy text-white rounded-xl text-xs uppercase font-bold"><Download className="w-4 h-4" /> Download CSV</button>
              </div>
            </div>
            <div className="lg:col-span-2 bg-white border border-gray-150 rounded-xl p-5 shadow-sm h-[480px] flex flex-col">
              <h4 className="text-xs uppercase tracking-wider font-bold text-gray-400 mb-3">Audit Trail Feeds</h4>
              <div className="flex-1 overflow-y-auto space-y-3">
                {recentLogs.map((log) => (
                  <div key={log.id} className="text-xs leading-relaxed border-b pb-2">
                    <div className="font-bold text-[8px] uppercase tracking-wide text-gray-400">Room {log.room_number}</div>
                    <p className="text-hotel-navy">{log.item_detail}: {log.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
