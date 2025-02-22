import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import {Invoice} from './Invoice';

interface Product {
  id: string;
  name: string;
  price: number;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  payment_id: string;
  order_items: OrderItem[];
}

interface Profile {
  address: string;
  city: string;
  state: string;
  country: string;
}

const OrderHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('address, city, state, country')
          .eq('id', user?.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*');
        
        if (productsError) throw productsError;
        setProducts(productsData || []);

        // Fetch orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select(`
            *,
            payment_id,
            order_items (*)
          `)
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });

        if (ordersError) throw ordersError;
        setOrders(ordersData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Order History</h1>
      
      {orders.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Order #{order.id.slice(0, 8)}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-3">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{products.find(p => p.id === item.product_id)?.name || 'Product'}</p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium">₹{item.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total</span>
                    <span className="font-semibold">₹{order.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="mt-4">
                    <Invoice orderDetails={{
                      orderId: order.id,
                      paymentId: order.payment_id,
                      date: new Date(order.created_at).toLocaleDateString(),
                      customerName: user?.user_metadata?.full_name || 'Customer',
                      customerEmail: user?.email || '',
                      customerAddress: profile?.address || '',
                      customerCity: profile?.city || '',
                      customerZip: profile?.state || '',
                      items: order.order_items.map(item => ({
                        name: products.find(p => p.id === item.product_id)?.name || 'Product',
                        quantity: item.quantity,
                        price: item.price
                      })),
                      subtotal: order.order_items.reduce((acc, item) => acc + item.price * item.quantity, 0),
                      tax: (order.order_items.reduce((acc, item) => acc + item.price * item.quantity, 0) * 0.18),
                      total: order.total_amount,
                      shipping_charges:100
                    }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
