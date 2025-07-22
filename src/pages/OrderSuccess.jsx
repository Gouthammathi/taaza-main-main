import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { db } from '../config/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

const OrderSuccess = ({ orderId, onNavigateToHome, onNavigate, activeTab, cartCount, query, setQuery, onAdminClick }) => {
  const [orderStatus, setOrderStatus] = useState('pending');
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    const orderRef = doc(db, 'orders', orderId);
    // Listen for real-time updates
    const unsubscribe = onSnapshot(orderRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setOrderStatus(data.status || 'pending');
        setOrderData(data);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
      <Header
        activeTab={activeTab}
        onNavigate={onNavigate}
        cartCount={cartCount}
        query={query}
        setQuery={setQuery}
        onAdminClick={onAdminClick}
      />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="card p-8 text-center">
            {/* Status Icon and Message */}
            {orderStatus !== 'paid' ? (
              <>
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">⏳</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Waiting for confirmation from store...
                </h1>
                <p className="text-gray-600 mb-6">
                  Your order has been placed. Please wait while the store confirms your payment.
                </p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">✅</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Order Placed Successfully!
                </h1>
                <p className="text-gray-600 mb-6">
                  Thank you for your order. We're preparing your fresh meat products.
                </p>
              </>
            )}

            {/* Order Details */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Number:</span>
                  <span className="font-medium">#{orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Pickup:</span>
                  <span className="font-medium">15-20 minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">Pay at Store</span>
                </div>
              </div>
              {/* Product List */}
              {orderData && orderData.items && orderData.items.length > 0 && (
                <div className="mt-4 text-left">
                  <div className="font-semibold text-gray-800 mb-2">Products:</div>
                  <ul className="divide-y divide-gray-200">
                    {orderData.items.map((item, idx) => (
                      <li key={idx} className="py-2 flex justify-between items-center">
                        <span className="font-medium text-gray-700">{item.name}</span>
                        <span className="text-gray-500 text-sm">Qty: {item.qty} | ₹{item.price} x {item.qty} = ₹{item.total}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Store Information */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-red-800 mb-2">Store Information</h3>
              <div className="text-sm text-red-700 space-y-1">
                <p><strong>Phone:</strong> +91 98765 43210</p>
                <p className="font-medium mt-2">
                  Please bring your order number when collecting.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={onNavigateToHome}
                className="w-full btn-primary py-3"
              >
                Continue Shopping
              </button>
              <div className="text-xs text-gray-500">
                You'll receive an SMS confirmation shortly.
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-6 text-center">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800 mb-2">What's Next?</h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• We'll start preparing your order immediately</p>
                <p>• You'll receive an SMS when it's ready</p>
                <p>• Collect your order within 30 minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess; 