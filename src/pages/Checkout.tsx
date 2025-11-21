
// Fix for error: Property 'PRODUCTS' does not exist on type '() => Element'
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

// Mock products data (temporary)
const PRODUCTS = [
  { id: 1, name: 'Basic T-Shirt', price: 19.99, image: '/placeholder.svg' },
  { id: 2, name: 'Premium Hoodie', price: 49.99, image: '/placeholder.svg' },
  { id: 3, name: 'Designer Polo', price: 29.99, image: '/placeholder.svg' },
];

const Checkout = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Find the product based on the ID from the URL params
  const product = PRODUCTS.find(p => p.id === parseInt(id || '0'));
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Checkout</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Summary */}
        <div className="md:w-1/3">
          <div className="border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
            <div className="flex items-center gap-4 mb-4">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-20 h-20 object-cover rounded"
              />
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-gray-500">Custom Design</p>
                <p className="font-semibold mt-1">${product.price.toFixed(2)}</p>
              </div>
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${product.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>$5.00</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Tax</span>
                <span>${(product.price * 0.08).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                <span>Total</span>
                <span>${(product.price + 5 + product.price * 0.08).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Checkout Form */}
        <div className="md:w-2/3">
          <h2 className="text-lg font-semibold mb-4">Shipping Information</h2>
          {/* Form would go here */}
          <form className="space-y-4">
            {/* Form fields would go here */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Place Order
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
