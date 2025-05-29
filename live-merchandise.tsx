'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/utils/auth';

interface MerchItem {
  id: string;
  name: string;
  description: string;
  category: 'apparel' | 'accessories' | 'music' | 'digital' | 'other';
  price: number;
  images: string[];
  sizes?: string[];
  colors?: string[];
  stock: number;
  isActive: boolean;
  isLiveExclusive: boolean;
  digitalDownload?: string;
  shippingRequired: boolean;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
}

interface LiveSale {
  id: string;
  itemId: string;
  item: MerchItem;
  quantity: number;
  customerName: string;
  customerEmail: string;
  shippingAddress?: Address;
  totalAmount: number;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  streamId?: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface MerchDisplay {
  id: string;
  name: string;
  items: string[];
  isActive: boolean;
  showDuringStream: boolean;
  autoPromote: boolean;
  promotionInterval: number;
  discountType?: 'percentage' | 'fixed';
  discountValue?: number;
  bannerText?: string;
  position: 'overlay' | 'sidebar' | 'banner';
}

export default function LiveMerchandise() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'inventory' | 'displays' | 'sales' | 'analytics'>('inventory');
  const [merchItems, setMerchItems] = useState<MerchItem[]>([]);
  const [displays, setDisplays] = useState<MerchDisplay[]>([]);
  const [liveSales, setLiveSales] = useState<LiveSale[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDisplayModal, setShowDisplayModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MerchItem | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);

  useEffect(() => {
    fetchMerchItems();
    fetchDisplays();
    fetchLiveSales();
    checkLiveStreamStatus();
  }, []);

  const fetchMerchItems = async () => {
    try {
      const response = await fetch('/api/merchandise', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setMerchItems(data.items || []);
    } catch (error) {
      console.error('Error fetching merchandise:', error);
    }
  };

  const fetchDisplays = async () => {
    try {
      const response = await fetch('/api/merchandise/displays', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setDisplays(data.displays || []);
    } catch (error) {
      console.error('Error fetching displays:', error);
    }
  };

  const fetchLiveSales = async () => {
    try {
      const response = await fetch('/api/merchandise/live-sales', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setLiveSales(data.sales || []);
    } catch (error) {
      console.error('Error fetching live sales:', error);
    }
  };

  const checkLiveStreamStatus = async () => {
    try {
      const response = await fetch('/api/live/status', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setIsLiveMode(data.isLive || false);
      setCurrentStreamId(data.streamId || null);
    } catch (error) {
      console.error('Error checking live stream status:', error);
    }
  };

  const createMerchItem = async (itemData: any) => {
    try {
      const response = await fetch('/api/merchandise', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      });
      
      if (response.ok) {
        setShowCreateModal(false);
        fetchMerchItems();
      }
    } catch (error) {
      console.error('Error creating merchandise item:', error);
    }
  };

  const createDisplay = async (displayData: any) => {
    try {
      const response = await fetch('/api/merchandise/displays', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(displayData)
      });
      
      if (response.ok) {
        setShowDisplayModal(false);
        fetchDisplays();
      }
    } catch (error) {
      console.error('Error creating display:', error);
    }
  };

  const toggleItemActive = async (itemId: string, isActive: boolean) => {
    try {
      await fetch(`/api/merchandise/${itemId}/toggle`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      });
      fetchMerchItems();
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const activateDisplay = async (displayId: string) => {
    try {
      await fetch(`/api/merchandise/displays/${displayId}/activate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      fetchDisplays();
    } catch (error) {
      console.error('Error activating display:', error);
    }
  };

  const renderInventory = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Merchandise Inventory</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {merchItems.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="relative">
              <img
                src={item.images[0] || '/api/placeholder/300/200'}
                alt={item.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 flex space-x-2">
                {item.isLiveExclusive && (
                  <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">Live Exclusive</span>
                )}
                <span className={`px-2 py-1 text-xs rounded-full ${
                  item.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-900">{item.name}</h3>
                <span className="text-lg font-bold text-green-600">${item.price}</span>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                <span className="capitalize">{item.category}</span>
                <span>{item.stock} in stock</span>
              </div>

              {item.sizes && item.sizes.length > 0 && (
                <div className="mb-3">
                  <span className="text-xs text-gray-500">Sizes: </span>
                  <div className="flex space-x-1 mt-1">
                    {item.sizes.map(size => (
                      <span key={size} className="px-2 py-1 bg-gray-100 text-xs rounded">{size}</span>
                    ))}
                  </div>
                </div>
              )}

              {item.colors && item.colors.length > 0 && (
                <div className="mb-3">
                  <span className="text-xs text-gray-500">Colors: </span>
                  <div className="flex space-x-1 mt-1">
                    {item.colors.map(color => (
                      <div
                        key={color}
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={() => toggleItemActive(item.id, !item.isActive)}
                  className={`flex-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                    item.isActive
                      ? 'bg-red-100 text-red-600 hover:bg-red-200'
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                >
                  {item.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  onClick={() => setSelectedItem(item)}
                  className="flex-1 px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {merchItems.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛍️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No merchandise items</h3>
          <p className="text-gray-600 mb-6">Add your first merchandise item to start selling during live streams</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add First Item
          </button>
        </div>
      )}
    </div>
  );

  const renderDisplays = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Live Displays</h2>
        <button
          onClick={() => setShowDisplayModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Display
        </button>
      </div>

      {isLiveMode && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium text-green-800">Currently Live - Displays Active</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displays.map(display => (
          <div key={display.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{display.name}</h3>
                <p className="text-sm text-gray-600">{display.items.length} items included</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  display.isActive ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {display.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  display.showDuringStream ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                }`}>
                  {display.position}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Auto Promote:</span>
                <span className="font-medium">{display.autoPromote ? 'Yes' : 'No'}</span>
              </div>
              {display.autoPromote && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Interval:</span>
                  <span className="font-medium">{display.promotionInterval}s</span>
                </div>
              )}
              {display.discountType && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Discount:</span>
                  <span className="font-medium">
                    {display.discountType === 'percentage' ? `${display.discountValue}%` : `$${display.discountValue}`} off
                  </span>
                </div>
              )}
            </div>

            {display.bannerText && (
              <div className="bg-blue-50 rounded p-3 mb-4">
                <p className="text-sm text-blue-800">{display.bannerText}</p>
              </div>
            )}

            <div className="flex space-x-2">
              {isLiveMode && (
                <button
                  onClick={() => activateDisplay(display.id)}
                  className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                >
                  Activate Now
                </button>
              )}
              <button className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {displays.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📺</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No displays created</h3>
          <p className="text-gray-600 mb-6">Create displays to showcase your merchandise during live streams</p>
          <button
            onClick={() => setShowDisplayModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create First Display
          </button>
        </div>
      )}
    </div>
  );

  const renderSales = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Live Sales</h2>
        <div className="text-sm text-gray-600">
          {liveSales.length} total sales • ${liveSales.reduce((sum, sale) => sum + sale.totalAmount, 0).toFixed(2)} revenue
        </div>
      </div>

      {liveSales.length > 0 ? (
        <div className="space-y-4">
          {liveSales.map(sale => (
            <div key={sale.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={sale.item.images[0] || '/api/placeholder/50/50'}
                    alt={sale.item.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{sale.item.name}</h3>
                    <p className="text-sm text-gray-600">Qty: {sale.quantity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">${sale.totalAmount.toFixed(2)}</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    sale.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                    sale.status === 'confirmed' ? 'bg-blue-100 text-blue-600' :
                    sale.status === 'shipped' ? 'bg-purple-100 text-purple-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {sale.status.toUpperCase()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="text-gray-500">Customer:</span>
                  <span className="ml-1">{sale.customerName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Email:</span>
                  <span className="ml-1">{sale.customerEmail}</span>
                </div>
                <div>
                  <span className="text-gray-500">Time:</span>
                  <span className="ml-1">{new Date(sale.timestamp).toLocaleTimeString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Shipping:</span>
                  <span className="ml-1">{sale.item.shippingRequired ? 'Required' : 'Digital'}</span>
                </div>
              </div>

              {sale.shippingAddress && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Shipping Address:</p>
                  <p className="text-sm text-gray-600">
                    {sale.shippingAddress.street}, {sale.shippingAddress.city}, {sale.shippingAddress.state} {sale.shippingAddress.zipCode}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💰</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sales yet</h3>
          <p className="text-gray-600">Sales from live streams will appear here</p>
        </div>
      )}
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Sales Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-gray-900 mb-1">${liveSales.reduce((sum, sale) => sum + sale.totalAmount, 0).toFixed(2)}</div>
          <div className="text-sm text-gray-500">Total Revenue</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-gray-900 mb-1">{liveSales.length}</div>
          <div className="text-sm text-gray-500">Total Sales</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-gray-900 mb-1">
            ${liveSales.length > 0 ? (liveSales.reduce((sum, sale) => sum + sale.totalAmount, 0) / liveSales.length).toFixed(2) : '0.00'}
          </div>
          <div className="text-sm text-gray-500">Avg. Order Value</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="text-2xl font-bold text-gray-900 mb-1">{merchItems.filter(item => item.isActive).length}</div>
          <div className="text-sm text-gray-500">Active Items</div>
        </div>
      </div>

      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Detailed Analytics Coming Soon</h3>
        <p className="text-gray-600">Advanced sales analytics and insights</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Live Merchandise</h1>
          <p className="text-gray-600">Sell merchandise during your live streams and concerts</p>
        </div>

        {/* Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'inventory', label: 'Inventory', icon: '📦' },
              { id: 'displays', label: 'Live Displays', icon: '📺' },
              { id: 'sales', label: 'Sales', icon: '💰' },
              { id: 'analytics', label: 'Analytics', icon: '📊' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        {activeTab === 'inventory' && renderInventory()}
        {activeTab === 'displays' && renderDisplays()}
        {activeTab === 'sales' && renderSales()}
        {activeTab === 'analytics' && renderAnalytics()}
      </div>

      {/* Create Item Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Merchandise Item</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              createMerchItem({
                name: formData.get('name'),
                description: formData.get('description'),
                category: formData.get('category'),
                price: parseFloat(formData.get('price') as string),
                stock: parseInt(formData.get('stock') as string),
                isLiveExclusive: formData.get('isLiveExclusive') === 'on',
                shippingRequired: formData.get('shippingRequired') === 'on',
                sizes: formData.get('sizes') ? (formData.get('sizes') as string).split(',').map(s => s.trim()) : [],
                colors: formData.get('colors') ? (formData.get('colors') as string).split(',').map(c => c.trim()) : []
              });
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                  <input
                    name="name"
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter item name"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the item"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="apparel">Apparel</option>
                    <option value="accessories">Accessories</option>
                    <option value="music">Music</option>
                    <option value="digital">Digital</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                  <input
                    name="stock"
                    type="number"
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sizes (comma separated)</label>
                  <input
                    name="sizes"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="S, M, L, XL"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Colors (comma separated)</label>
                  <input
                    name="colors"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Black, White, Blue"
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div className="flex items-center">
                    <input
                      name="isLiveExclusive"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Live Stream Exclusive</label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      name="shippingRequired"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 text-sm text-gray-700">Requires Shipping</label>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}