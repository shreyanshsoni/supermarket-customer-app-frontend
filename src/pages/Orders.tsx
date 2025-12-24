import { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
} from "../components/ui/Card";
import Button from "../components/ui/Button";
import { orderService, type Order } from "../services/orders";

const Orders = () => {
  const { orderId } = useParams<{ orderId?: string }>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (orderId) {
      loadOrder(orderId);
    } else {
      loadOrders();
    }
  }, [orderId]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getOrders();
      setOrders(response.orders);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrder = async (id: string) => {
    setLoading(true);
    try {
      const response = await orderService.getOrder(id);
      setSelectedOrder(response.order);
    } catch (error) {
      console.error("Error loading order:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "text-emerald-600 bg-emerald-50";
      case "processing":
      case "shipped":
        return "text-blue-600 bg-blue-50";
      case "cancelled":
        return "text-red-600 bg-red-50";
      case "paid":
        return "text-emerald-600 bg-emerald-50";
      case "pending":
        return "text-amber-600 bg-amber-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusBadge = (status: string, label: string) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
      {label}
    </span>
  );

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  // Invoice Detail View
  if (orderId && selectedOrder) {
    return (
      <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
        {/* Action Buttons - Hidden on Print */}
        <div className="max-w-3xl mx-auto px-4 mb-6 print:hidden">
          <div className="flex justify-between items-center">
            <Link to="/orders">
              <Button variant="outline" className="gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 19-7-7 7-7"/>
                  <path d="M19 12H5"/>
                </svg>
                Back to Orders
              </Button>
            </Link>
            <Button onClick={handlePrint} className="gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect width="12" height="8" x="6" y="14"/>
              </svg>
              Print Invoice
            </Button>
          </div>
        </div>

        {/* Invoice Paper */}
        <div 
          ref={invoiceRef}
          className="max-w-3xl mx-auto bg-white shadow-xl print:shadow-none print:max-w-none"
          style={{ fontFamily: "'Courier Prime', 'Courier New', monospace" }}
        >
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-8 py-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "system-ui, sans-serif" }}>
                  FreshMart
                </h1>
                <p className="text-gray-400 text-sm mt-1">Your Neighborhood Supermarket</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold tracking-wider">INVOICE</div>
                <div className="text-gray-400 text-sm mt-1">Tax Invoice / Bill of Supply</div>
              </div>
            </div>
          </div>

          {/* Invoice Meta */}
          <div className="px-8 py-6 border-b border-dashed border-gray-300">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Invoice Number</div>
                <div className="font-bold text-lg">INV-{selectedOrder._id.slice(-8).toUpperCase()}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Invoice Date</div>
                <div className="font-bold">{formatDate(selectedOrder.createdAt)}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 mt-4">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order Status</div>
                <div>{getStatusBadge(selectedOrder.orderStatus, selectedOrder.orderStatus.charAt(0).toUpperCase() + selectedOrder.orderStatus.slice(1))}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Payment Status</div>
                <div>{getStatusBadge(selectedOrder.paymentStatus, selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1))}</div>
              </div>
            </div>
          </div>

          {/* Bill To Section */}
          <div className="px-8 py-6 border-b border-dashed border-gray-300">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Deliver To
                </div>
                <div className="bg-gray-50 rounded-lg p-4" style={{ fontFamily: "system-ui, sans-serif" }}>
                  <div className="font-semibold text-gray-900">{selectedOrder.address?.name || 'N/A'}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {selectedOrder.address?.phone && (
                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                        </svg>
                        {selectedOrder.address.phone}
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    {selectedOrder.address?.addressLine1 || ''}
                    {selectedOrder.address?.addressLine2 && <>, {selectedOrder.address.addressLine2}</>}
                  </div>
                  <div className="text-sm text-gray-600">
                    {selectedOrder.address?.city || ''}, {selectedOrder.address?.state || ''} - {selectedOrder.address?.pincode || ''}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="14" x="2" y="5" rx="2"/>
                    <line x1="2" x2="22" y1="10" y2="10"/>
                  </svg>
                  Payment Details
                </div>
                <div className="bg-gray-50 rounded-lg p-4" style={{ fontFamily: "system-ui, sans-serif" }}>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Method</span>
                    <span className="font-medium">{selectedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Razorpay'}</span>
                  </div>
                  {selectedOrder.razorpayPaymentId && (
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-500">Transaction ID</span>
                      <span className="font-mono text-xs">{selectedOrder.razorpayPaymentId}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">Order Time</span>
                    <span className="font-medium">{formatDateTime(selectedOrder.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="px-8 py-6">
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                <path d="M3 6h18"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              Order Items
            </div>
            
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 py-3 border-y-2 border-gray-900 text-xs uppercase tracking-wider font-bold">
              <div className="col-span-1 text-center">#</div>
              <div className="col-span-5">Item Description</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Amount</div>
            </div>

            {/* Table Body */}
            {selectedOrder.items.map((item, index) => (
              <div 
                key={index} 
                className="grid grid-cols-12 gap-4 py-4 border-b border-gray-200 items-center"
                style={{ fontFamily: "system-ui, sans-serif" }}
              >
                <div className="col-span-1 text-center text-gray-500 font-mono">{String(index + 1).padStart(2, '0')}</div>
                <div className="col-span-5">
                  <div className="font-medium text-gray-900">{item.name}</div>
                </div>
                <div className="col-span-2 text-center font-mono">{item.quantity}</div>
                <div className="col-span-2 text-right font-mono">₹{item.price.toFixed(2)}</div>
                <div className="col-span-2 text-right font-mono font-semibold">₹{(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}

            {/* Totals */}
            <div className="mt-6 flex justify-end">
              <div className="w-72">
                <div className="flex justify-between py-2 text-sm" style={{ fontFamily: "system-ui, sans-serif" }}>
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-mono">₹{selectedOrder.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 text-sm" style={{ fontFamily: "system-ui, sans-serif" }}>
                  <span className="text-gray-500">GST (18%)</span>
                  <span className="font-mono">₹{selectedOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2 text-sm" style={{ fontFamily: "system-ui, sans-serif" }}>
                  <span className="text-gray-500">Delivery Fee</span>
                  <span className="font-mono">{selectedOrder.deliveryFee === 0 ? 'FREE' : `₹${selectedOrder.deliveryFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between py-3 mt-2 border-t-2 border-gray-900 border-dashed">
                  <span className="font-bold text-lg" style={{ fontFamily: "system-ui, sans-serif" }}>Grand Total</span>
                  <span className="font-bold text-lg font-mono">₹{selectedOrder.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-gray-50 border-t border-dashed border-gray-300">
            <div className="text-center" style={{ fontFamily: "system-ui, sans-serif" }}>
              <div className="text-gray-600 text-sm mb-2">
                Thank you for shopping with us!
              </div>
              <div className="text-xs text-gray-400">
                For any queries, contact us at support@freshmart.com | +91 1800-XXX-XXXX
              </div>
              <div className="text-xs text-gray-400 mt-1">
                This is a computer-generated invoice and does not require a signature.
              </div>
            </div>
            
            {/* Decorative Perforation Line */}
            <div className="mt-6 border-t-2 border-dashed border-gray-300 relative">
              <div className="absolute -top-2 left-0 w-4 h-4 bg-gray-100 rounded-full"></div>
              <div className="absolute -top-2 right-0 w-4 h-4 bg-gray-100 rounded-full"></div>
            </div>
            
            <div className="mt-4 text-center text-xs text-gray-400">
              ★ ★ ★ Please retain this invoice for future reference ★ ★ ★
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No orders yet</p>
          <Link to="/products">
            <Button>Start Shopping</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order._id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <Link to={`/orders/${order._id}`}>
                      <h3 className="font-semibold hover:text-primary transition-colors">
                        Order #{order._id.slice(-8)}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus.charAt(0).toUpperCase() +
                        order.orderStatus.slice(1)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ₹{order.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.items.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <p className="text-sm text-muted-foreground">
                      +{order.items.length - 3} more items
                    </p>
                  )}
                </div>

                <Link to={`/orders/${order._id}`} className="block mt-4">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
