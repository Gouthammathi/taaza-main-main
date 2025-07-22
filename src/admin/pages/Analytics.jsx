import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const STOCK_ITEMS = [
  { key: 'birds', label: 'Birds' },
  { key: 'goats', label: 'Goats' },
  { key: 'white-eggs', label: 'White Eggs' },
  { key: 'country-eggs', label: 'Brown Eggs' },
];
const SALES_ITEMS = [
  { key: 'chicken', label: 'Chicken (kg)' },
  { key: 'mutton', label: 'Mutton (kg)' },
  { key: 'w-eggs', label: 'White Eggs' },
  { key: 'c-eggs', label: 'Brown Eggs' },
];

function Analytics() {
  // State for In Stock section
  const [stock, setStock] = useState({
    birds: { incoming: '', wastage: '' },
    goats: { incoming: '', wastage: '' },
    'white-eggs': { incoming: '', wastage: '' },
    'country-eggs': { incoming: '', wastage: '' },
  });
  const [available, setAvailable] = useState({
    birds: 0,
    goats: 0,
    'white-eggs': 0,
    'country-eggs': 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State for Sales section
  const [sales, setSales] = useState({
    chicken: '',
    mutton: '',
    'w-eggs': '',
    'c-eggs': '',
  });
  const [salesAvailable, setSalesAvailable] = useState({
    chicken: 0,
    mutton: 0,
    'w-eggs': 0,
    'c-eggs': 0,
  });
  const [salesSaving, setSalesSaving] = useState(false);

  // Fetch available stock from Firestore
  useEffect(() => {
    const unsubscribes = STOCK_ITEMS.map(item =>
      onSnapshot(doc(db, 'stock', item.key), (docSnap) => {
        setAvailable(prev => ({
          ...prev,
          [item.key]: docSnap.exists() ? (docSnap.data().available || 0) : 0,
        }));
      })
    );
    setLoading(false);
    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  // Fetch available sales from Firestore
  useEffect(() => {
    const unsubscribes = SALES_ITEMS.map(item =>
      onSnapshot(doc(db, 'sales', item.key), (docSnap) => {
        setSalesAvailable(prev => ({
          ...prev,
          [item.key]: docSnap.exists() ? (docSnap.data().value || 0) : 0,
        }));
      })
    );
    return () => unsubscribes.forEach(unsub => unsub());
  }, []);

  // Handler for input changes
  const handleStockChange = (type, field, value) => {
    setStock((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value,
      },
    }));
  };
  const handleSalesChange = (type, value) => {
    setSales((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  // Save handler for stock
  const handleSave = async () => {
    setSaving(true);
    try {
      for (const item of STOCK_ITEMS) {
        const key = item.key;
        const docRef = doc(db, 'stock', key);
        const docSnap = await getDoc(docRef);
        const prevAvailable = docSnap.exists() ? (docSnap.data().available || 0) : 0;
        const incoming = Number(stock[key].incoming) || 0;
        const wastage = Number(stock[key].wastage) || 0;
        // Calculate new available stock
        let newAvailable = prevAvailable + incoming - wastage;
        if (newAvailable < 0) newAvailable = 0;
        await setDoc(docRef, { available: newAvailable }, { merge: true });
      }
      // Clear input fields after save
      setStock({
        birds: { incoming: '', wastage: '' },
        goats: { incoming: '', wastage: '' },
        'white-eggs': { incoming: '', wastage: '' },
        'country-eggs': { incoming: '', wastage: '' },
      });
    } catch (err) {
      alert('Failed to save stock.');
    }
    setSaving(false);
  };

  // Save handler for sales
  const handleSalesSave = async () => {
    setSalesSaving(true);
    try {
      for (const item of SALES_ITEMS) {
        const key = item.key;
        const docRef = doc(db, 'sales', key);
        const value = Number(sales[key]) || 0;
        await setDoc(docRef, { value }, { merge: true });
      }
      setSales({ chicken: '', mutton: '', 'w-eggs': '', 'c-eggs': '' });
    } catch (err) {
      alert('Failed to save sales.');
    }
    setSalesSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-10">
      {/* In Stock Section */}
      <section className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-gray-800">In Stock</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {STOCK_ITEMS.map(item => (
            <div className="space-y-2" key={item.key}>
              <h3 className="font-semibold text-gray-700">{item.label}</h3>
              <div className="mb-1 text-sm text-blue-700 font-semibold">
                Available Stock: {loading ? '...' : available[item.key]}
              </div>
              <label className="block text-sm text-gray-600">Incoming Stock</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={stock[item.key]?.incoming || ''}
                onChange={e => handleStockChange(item.key, 'incoming', e.target.value)}
                placeholder="Enter incoming stock"
              />
              <label className="block text-sm text-gray-600 mt-2">Wastage</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={stock[item.key]?.wastage || ''}
                onChange={e => handleStockChange(item.key, 'wastage', e.target.value)}
                placeholder="Enter wastage"
              />
            </div>
          ))}
        </div>
        <button
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </section>
      {/* Sales Section */}
      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Sales</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SALES_ITEMS.map(item => (
            <div className="space-y-2" key={item.key}>
              <h3 className="font-semibold text-gray-700">{item.label}</h3>
              <div className="mb-1 text-sm text-blue-700 font-semibold">
                Current Value: {salesAvailable[item.key]}
              </div>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                value={sales[item.key] || ''}
                onChange={e => handleSalesChange(item.key, e.target.value)}
                placeholder={`Enter ${item.label.toLowerCase()}`}
              />
            </div>
          ))}
        </div>
        <button
          className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          onClick={handleSalesSave}
          disabled={salesSaving}
        >
          {salesSaving ? 'Saving...' : 'Save'}
        </button>
      </section>
    </div>
  );
}

export default Analytics;