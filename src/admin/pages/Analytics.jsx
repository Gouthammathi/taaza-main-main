import React, { useState, useEffect, useRef } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  getDailyStock,
  setDailyStock
} from '../../services/firebaseService';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
 
const formatDate = (date) => {
  // Format date as YYYY-MM-DD
  return date.toISOString().split('T')[0];
};
 
const Analytics = () => {
  // State for date picker
  const [selectedDate, setSelectedDate] = useState(new Date());
  // In-Stock section
  const [incomingBirds, setIncomingBirds] = useState('');
  const [todayWeight, setTodayWeight] = useState('');
  // Yesterday's Stock section
  const [leftBirds, setLeftBirds] = useState('');
  const [leftWeight, setLeftWeight] = useState('');
  // Total weight
  const [totalWeight, setTotalWeight] = useState(0);
  // Loading and error
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
 
  // Wastage/damage
  const [wastage, setWastage] = useState('');
  const [availableWeight, setAvailableWeight] = useState(null);
  // In-Stock card state
  const [inStockLoading, setInStockLoading] = useState(false);
  const [inStockSaved, setInStockSaved] = useState(false);
  // Yesterday's Stock card state
  const [yesterdayLoading, setYesterdayLoading] = useState(false);
  const [yesterdaySaved, setYesterdaySaved] = useState(false);
  // Wastage/Damage card state
  const [wastageLoading, setWastageLoading] = useState(false);
  const [wastageSaved, setWastageSaved] = useState(false);
  // Sale card state
  const [stockEndDay, setStockEndDay] = useState('');
  const [stockSold, setStockSold] = useState(null);
  const [saleLoading, setSaleLoading] = useState(false);
  const [saleSaved, setSaleSaved] = useState(false);
  // Average card state
  const [todaysPrice, setTodaysPrice] = useState('');
  const [priceAvg, setPriceAvg] = useState(null);
  const [avgLoading, setAvgLoading] = useState(false);
  const [avgSaved, setAvgSaved] = useState(false);
 
  // Eggs card state
  const [eggsTraysToday, setEggsTraysToday] = useState('');
  const [eggsTraysLeft, setEggsTraysLeft] = useState('');
  const [eggsTraysEndDay, setEggsTraysEndDay] = useState('');
  const [eggsPriceToday, setEggsPriceToday] = useState('');
  const [eggsLoading, setEggsLoading] = useState(false);
  const [eggsSaved, setEggsSaved] = useState(false);
  const [eggsToday, setEggsToday] = useState(0);
  const [eggsLeft, setEggsLeft] = useState(0);
  const [eggsEndDay, setEggsEndDay] = useState(0);
  const [liveStockEggs, setLiveStockEggs] = useState(0);
  const [stockSoldEggs, setStockSoldEggs] = useState(0);
  const [totalPriceEggs, setTotalPriceEggs] = useState(0);
 
  // Refs to track if update is from fetch
  const isFetching = useRef(false);
 
  // Reset save state on field change (only if not fetching)
  useEffect(() => { if (!isFetching.current) setInStockSaved(false); }, [incomingBirds, todayWeight]);
  useEffect(() => { if (!isFetching.current) setYesterdaySaved(false); }, [leftBirds, leftWeight]);
  useEffect(() => { if (!isFetching.current) { setWastageSaved(false); setAvailableWeight(null); } }, [wastage]);
  useEffect(() => { if (!isFetching.current) { setSaleSaved(false); setStockSold(null); } }, [stockEndDay]);
  useEffect(() => { if (!isFetching.current) { setAvgSaved(false); setPriceAvg(null); } }, [todaysPrice]);
  useEffect(() => { if (!isFetching.current) { setEggsSaved(false); setLiveStockEggs(0); setStockSoldEggs(0); } }, [selectedDate]);
 
  // Calculate eggs fields automatically
  useEffect(() => {
    setEggsToday(Number(eggsTraysToday) * 30 || 0);
  }, [eggsTraysToday]);
  useEffect(() => {
    setEggsLeft(Number(eggsTraysLeft) * 30 || 0);
  }, [eggsTraysLeft]);
  useEffect(() => {
    setEggsEndDay(Number(eggsTraysEndDay) * 30 || 0);
  }, [eggsTraysEndDay]);
  useEffect(() => {
    setLiveStockEggs(eggsToday + eggsLeft);
  }, [eggsToday, eggsLeft]);
  useEffect(() => {
    setStockSoldEggs(liveStockEggs - eggsEndDay);
  }, [liveStockEggs, eggsEndDay]);
  useEffect(() => {
    setTotalPriceEggs(Number(eggsPriceToday) * stockSoldEggs || 0);
  }, [eggsPriceToday, stockSoldEggs]);
 
  // Fetch data for selected date (add wastage)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setMessage('');
      isFetching.current = true;
      try {
        const dateStr = formatDate(selectedDate);
        const data = await getDailyStock(dateStr);
        if (data) {
          setIncomingBirds(data.incomingBirds || '');
          setTodayWeight(data.todayWeight || '');
          setLeftBirds(data.leftBirds || '');
          setLeftWeight(data.leftWeight || '');
          setWastage(data.wastage || '');
          setStockEndDay(data.stockEndDay !== undefined ? String(data.stockEndDay) : '');
          setTodaysPrice(data.todaysPrice !== undefined ? String(data.todaysPrice) : '');
 
          // Set from DB if present, else null (so recalculation can happen)
          setAvailableWeight(data.liveStock !== undefined ? data.liveStock : null);
          const sold = data.stockSold !== undefined ? data.stockSold : null;
          setStockSold(sold);
          setPriceAvg(data.priceavg !== undefined ? data.priceavg : null);
 
          setInStockSaved(true);
          setYesterdaySaved(true);
          setWastageSaved(true);
          setSaleSaved(true);
          setAvgSaved(true);
        } else {
          setIncomingBirds('');
          setTodayWeight('');
          setLeftBirds('');
          setLeftWeight('');
          setWastage('');
          setStockEndDay('');
          setStockSold(null);
          setTodaysPrice('');
          setPriceAvg(null);
          setAvailableWeight(null);
          setInStockSaved(false);
          setYesterdaySaved(false);
          setWastageSaved(false);
          setSaleSaved(false);
          setAvgSaved(false);
        }
      } catch (err) {
        setMessage('Error fetching data.');
      }
      isFetching.current = false;
      setLoading(false);
    };
    fetchData();
  }, [selectedDate]);
 
  // Fetch eggs data for selected date
  useEffect(() => {
    const fetchEggs = async () => {
      setEggsLoading(true);
      try {
        const dateStr = formatDate(selectedDate);
        const docRef = doc(db, 'eggsStock', dateStr);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setEggsTraysToday(data.traysToday !== undefined ? String(data.traysToday) : '');
          setEggsTraysLeft(data.traysLeft !== undefined ? String(data.traysLeft) : '');
          setEggsTraysEndDay(data.traysEndDay !== undefined ? String(data.traysEndDay) : '');
          setEggsPriceToday(data.priceToday !== undefined ? String(data.priceToday) : '');
          setEggsToday(data.eggsToday !== undefined ? data.eggsToday : (Number(data.traysToday) * 30 || 0));
          setEggsLeft(data.eggsLeft !== undefined ? data.eggsLeft : (Number(data.traysLeft) * 30 || 0));
          setEggsEndDay(data.eggsEndDay !== undefined ? data.eggsEndDay : (Number(data.traysEndDay) * 30 || 0));
          setLiveStockEggs(data.liveStockEggs !== undefined ? data.liveStockEggs : ((Number(data.traysToday) * 30 || 0) + (Number(data.traysLeft) * 30 || 0)));
          setStockSoldEggs(data.stockSoldEggs !== undefined ? data.stockSoldEggs : (((Number(data.traysToday) * 30 || 0) + (Number(data.traysLeft) * 30 || 0)) - (Number(data.traysEndDay) * 30 || 0)));
          setEggsSaved(true);
        } else {
          setEggsTraysToday('');
          setEggsTraysLeft('');
          setEggsTraysEndDay('');
          setEggsPriceToday('');
          setEggsToday(0);
          setEggsLeft(0);
          setEggsEndDay(0);
          setLiveStockEggs(0);
          setStockSoldEggs(0);
          setEggsSaved(false);
        }
      } catch (err) {
        setMessage('Error fetching eggs data.');
      }
      setEggsLoading(false);
    };
    fetchEggs();
  }, [selectedDate]);
 
  // Calculate total weight
  useEffect(() => {
    const tWeight = (parseFloat(todayWeight) || 0) + (parseFloat(leftWeight) || 0);
    setTotalWeight(tWeight);
  }, [todayWeight, leftWeight]);
 
  // Recalculate derived fields if not present in DB
  useEffect(() => {
    if (availableWeight === null || availableWeight === undefined) {
      const liveStock = (parseFloat(todayWeight) || 0) + (parseFloat(leftWeight) || 0) - (parseFloat(wastage) || 0);
      setAvailableWeight(liveStock);
    }
  }, [todayWeight, leftWeight, wastage, availableWeight]);
 
  useEffect(() => {
    if (stockSold === null || stockSold === undefined) {
      const liveStock = availableWeight !== null && availableWeight !== undefined
        ? availableWeight
        : (parseFloat(todayWeight) || 0) + (parseFloat(leftWeight) || 0) - (parseFloat(wastage) || 0);
      const sold = liveStock - (parseFloat(stockEndDay) || 0);
      setStockSold(sold);
    }
  }, [availableWeight, stockEndDay, todayWeight, leftWeight, wastage, stockSold]);
 
  useEffect(() => {
    if (priceAvg === null || priceAvg === undefined) {
      const avg = (parseFloat(todaysPrice) || 0) / 1.7;
      setPriceAvg(avg);
    }
  }, [todaysPrice, priceAvg]);
 
  // Unified Chicken Save button handler
  const handleSaveChicken = async () => {
    setInStockLoading(true); // reuse loading state for unified button
    setMessage('');
    try {
      const dateStr = formatDate(selectedDate);
      const liveStock = (parseFloat(todayWeight) || 0) + (parseFloat(leftWeight) || 0) - (parseFloat(wastage) || 0);
      const sold = liveStock - (parseFloat(stockEndDay) || 0);
      const avg = (parseFloat(todaysPrice) || 0) / 1.7;
      await setDailyStock(dateStr, {
        incomingBirds: incomingBirds ? Number(incomingBirds) : '',
        todayWeight: todayWeight ? Number(todayWeight) : '',
        leftBirds: leftBirds ? Number(leftBirds) : '',
        leftWeight: leftWeight ? Number(leftWeight) : '',
        wastage: wastage ? Number(wastage) : '',
        liveStock,
        stockEndDay: stockEndDay ? Number(stockEndDay) : '',
        stockSold: sold,
        todaysPrice: todaysPrice ? Number(todaysPrice) : '',
        priceavg: avg,
        date: dateStr,
      });
      setAvailableWeight(liveStock);
      setStockSold(sold);
      setPriceAvg(avg);
      setInStockSaved(true);
      setYesterdaySaved(true);
      setWastageSaved(true);
      setSaleSaved(true);
      setAvgSaved(true);
      setMessage('Chicken data saved!');
    } catch (err) {
      setMessage('Error saving Chicken data.');
    }
    setInStockLoading(false);
  };
 
  // Save Yesterday's Stock section
  const handleSaveYesterday = async () => {
    setYesterdayLoading(true);
    setMessage('');
    try {
      const dateStr = formatDate(selectedDate);
      await setDailyStock(dateStr, {
        incomingBirds: incomingBirds ? Number(incomingBirds) : '',
        todayWeight: todayWeight ? Number(todayWeight) : '',
        leftBirds: leftBirds ? Number(leftBirds) : '',
        leftWeight: leftWeight ? Number(leftWeight) : '',
        wastage: wastage ? Number(wastage) : '',
        date: dateStr,
      });
      setMessage("Yesterday's stock saved!");
      setYesterdaySaved(true);
    } catch (err) {
      setMessage('Error saving Yesterday\'s stock.');
    }
    setYesterdayLoading(false);
  };
 
  // Submit wastage/damage and calculate available weight
  const handleSubmitWastage = async () => {
    setWastageLoading(true);
    setMessage('');
    try {
      const dateStr = formatDate(selectedDate);
      const total = (parseFloat(todayWeight) || 0) + (parseFloat(leftWeight) || 0) - (parseFloat(wastage) || 0);
      await setDailyStock(dateStr, {
        incomingBirds: incomingBirds ? Number(incomingBirds) : '',
        todayWeight: todayWeight ? Number(todayWeight) : '',
        leftBirds: leftBirds ? Number(leftBirds) : '',
        leftWeight: leftWeight ? Number(leftWeight) : '',
        wastage: wastage ? Number(wastage) : '',
        liveStock: total,
        date: dateStr,
      });
      setAvailableWeight(total);
      setWastageSaved(true);
    } catch (err) {
      setMessage('Error saving wastage/damage.');
    }
    setWastageLoading(false);
  };
 
  // Handle No Damage button
  const handleNoDamage = async () => {
    setWastageLoading(true);
    setMessage('');
    try {
      const dateStr = formatDate(selectedDate);
      const total = (parseFloat(todayWeight) || 0) + (parseFloat(leftWeight) || 0);
      await setDailyStock(dateStr, {
        incomingBirds: incomingBirds ? Number(incomingBirds) : '',
        todayWeight: todayWeight ? Number(todayWeight) : '',
        leftBirds: leftBirds ? Number(leftBirds) : '',
        leftWeight: leftWeight ? Number(leftWeight) : '',
        wastage: 0,
        liveStock: total,
        date: dateStr,
      });
      setWastage('0');
      setAvailableWeight(total);
      setWastageSaved(true);
    } catch (err) {
      setMessage('Error saving no damage.');
    }
    setWastageLoading(false);
  };
 
  // Handle Sale submit
  const handleSubmitSale = async () => {
    setSaleLoading(true);
    setMessage('');
    try {
      // Use the most recent availableWeight (Live Stock)
      const liveStock = availableWeight !== null ? availableWeight : (parseFloat(todayWeight) || 0) + (parseFloat(leftWeight) || 0) - (parseFloat(wastage) || 0);
      const sold = liveStock - (parseFloat(stockEndDay) || 0);
      setStockSold(sold);
      setSaleSaved(true);
      // Optionally, you can save this to Firestore as well:
      const dateStr = formatDate(selectedDate);
      await setDailyStock(dateStr, {
        incomingBirds: incomingBirds ? Number(incomingBirds) : '',
        todayWeight: todayWeight ? Number(todayWeight) : '',
        leftBirds: leftBirds ? Number(leftBirds) : '',
        leftWeight: leftWeight ? Number(leftWeight) : '',
        wastage: wastage ? Number(wastage) : '',
        stockEndDay: stockEndDay ? Number(stockEndDay) : '',
        stockSold: sold,
        date: dateStr,
      });
    } catch (err) {
      setMessage('Error saving sale data.');
    }
    setSaleLoading(false);
  };
 
  // Handle Average save
  const handleSaveAverage = async () => {
    setAvgLoading(true);
    setMessage('');
    try {
      const dateStr = formatDate(selectedDate);
      const avg = (parseFloat(todaysPrice) || 0) / 1.7;
      setPriceAvg(avg);
      setAvgSaved(true);
      await setDailyStock(dateStr, {
        incomingBirds: incomingBirds ? Number(incomingBirds) : '',
        todayWeight: todayWeight ? Number(todayWeight) : '',
        leftBirds: leftBirds ? Number(leftBirds) : '',
        leftWeight: leftWeight ? Number(leftWeight) : '',
        wastage: wastage ? Number(wastage) : '',
        liveStock: availableWeight !== null ? availableWeight : (parseFloat(todayWeight) || 0) + (parseFloat(leftWeight) || 0) - (parseFloat(wastage) || 0),
        stockEndDay: stockEndDay ? Number(stockEndDay) : '',
        stockSold: stockSold !== null ? stockSold : '',
        todaysPrice: todaysPrice ? Number(todaysPrice) : '',
        priceavg: avg,
        date: dateStr,
      });
    } catch (err) {
      setMessage('Error saving average data.');
    }
    setAvgLoading(false);
  };
 
  // Save Eggs section
  const handleSaveEggs = async () => {
    setEggsLoading(true);
    setMessage('');
    try {
      const dateStr = formatDate(selectedDate);
      await setDoc(doc(db, 'eggsStock', dateStr), {
        traysToday: eggsTraysToday ? Number(eggsTraysToday) : '',
        eggsToday,
        traysLeft: eggsTraysLeft ? Number(eggsTraysLeft) : '',
        eggsLeft,
        traysEndDay: eggsTraysEndDay ? Number(eggsTraysEndDay) : '',
        eggsEndDay,
        priceToday: eggsPriceToday ? Number(eggsPriceToday) : '',
        liveStockEggs,
        stockSoldEggs,
        totalPriceEggs,
        date: dateStr,
      });
      setEggsSaved(true);
      setMessage('Eggs data saved!');
    } catch (err) {
      setMessage('Error saving Eggs data.');
    }
    setEggsLoading(false);
  };
 
  // Button style helpers
  const getButtonClass = (saved) =>
    saved
      ? 'bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200'
      : 'btn-primary';
 
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-4">
        <label className="block font-medium mb-1">Select Date:</label>
        <DatePicker
          selected={selectedDate}
          onChange={date => setSelectedDate(date)}
          dateFormat="yyyy-MM-dd"
          className="border rounded px-2 py-1"
        />
      </div>
      <div className="card p-6 mb-6">
        <h2 className="text-3xl font-bold mb-6">Chicken</h2>
        <div className="mb-4">
          <label className="block font-medium mb-1">Select Date:</label>
          <DatePicker
            selected={selectedDate}
            onChange={date => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            className="border rounded px-2 py-1"
          />
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="card p-4 flex-1">
            <h3 className="text-lg font-semibold mb-2">In-Stock</h3>
            <div className="mb-2">
              <label className="block mb-1">Number of birds (incoming):</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full"
                value={incomingBirds}
                onChange={e => setIncomingBirds(e.target.value)}
                min="0"
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Weight of birds (in kgs) (today):</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full"
                value={todayWeight}
                onChange={e => setTodayWeight(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="card p-4 flex-1">
            <h3 className="text-lg font-semibold mb-2">Yesterday's Stock</h3>
            <div className="mb-2">
              <label className="block mb-1">Number of birds left:</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full"
                value={leftBirds}
                onChange={e => setLeftBirds(e.target.value)}
                min="0"
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Weight of birds left (in kgs):</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full"
                value={leftWeight}
                onChange={e => setLeftWeight(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="card p-4 flex-1">
            <h3 className="text-lg font-semibold mb-2">Wastage/Damage</h3>
            <div className="mb-2">
              <label className="block mb-1">Wastage/damage (in kgs):</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full"
                value={wastage}
                onChange={e => setWastage(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mt-4">
          <div className="card p-4 flex-1">
            <h3 className="text-lg font-semibold mb-2">Sale</h3>
            <div className="mb-2">
              <label className="block mb-1">Stock end of the day (in kgs):</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full"
                value={stockEndDay}
                onChange={e => setStockEndDay(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>
          <div className="card p-4 flex-1">
            <h3 className="text-lg font-semibold mb-2">Average</h3>
            <div className="mb-2">
              <label className="block mb-1">Today's price (in rupees):</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full"
                value={todaysPrice}
                onChange={e => setTodaysPrice(e.target.value)}
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>
        {/* Summary row and Save button */}
        <div className="flex flex-col md:flex-row items-end justify-between mt-6">
          <div className="flex flex-col md:flex-row gap-8 w-full">
            <div className="flex-1">
              <h4 className="font-semibold">Live Stock (in kgs):</h4>
              <div className="text-xl font-bold">{availableWeight !== null && availableWeight !== undefined ? Number(availableWeight).toFixed(2) : '0.00'}</div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Stock sold (in kgs):</h4>
              <div className="text-xl font-bold">{stockSold !== null && stockSold !== undefined ? Number(stockSold).toFixed(2) : '0.00'}</div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Average:</h4>
              <div className="text-xl font-bold">{priceAvg !== null && priceAvg !== undefined ? Number(priceAvg).toFixed(2) : '0.00'}</div>
            </div>
          </div>
          <button
            className={getButtonClass(inStockSaved)}
            onClick={handleSaveChicken}
            disabled={inStockLoading}
            style={{ minWidth: 120 }}
          >
            {inStockSaved ? 'Saved' : inStockLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      <div className="card p-6 mb-6">
        <h2 className="text-3xl font-bold mb-6">Eggs</h2>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="card p-4 flex-1">
            <h3 className="text-lg font-semibold mb-2">In-Stock</h3>
            <div className="mb-2">
              <label className="block mb-1">Number of trays (today):</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full"
                value={eggsTraysToday}
                onChange={e => setEggsTraysToday(e.target.value)}
                min="0"
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Number of eggs (today):</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full bg-gray-100"
                value={eggsToday}
                readOnly
              />
            </div>
          </div>
          <div className="card p-4 flex-1">
            <h3 className="text-lg font-semibold mb-2">Yesterday's Stock</h3>
            <div className="mb-2">
              <label className="block mb-1">Number of trays (left):</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full"
                value={eggsTraysLeft}
                onChange={e => setEggsTraysLeft(e.target.value)}
                min="0"
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Number of eggs (left):</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full bg-gray-100"
                value={eggsLeft}
                readOnly
              />
            </div>
          </div>
          <div className="card p-4 flex-1">
            <h3 className="text-lg font-semibold mb-2">Sale</h3>
            <div className="mb-2">
              <label className="block mb-1">Number of trays (end of the day):</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full"
                value={eggsTraysEndDay}
                onChange={e => setEggsTraysEndDay(e.target.value)}
                min="0"
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1">Number of eggs (end of the day):</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full bg-gray-100"
                value={eggsEndDay}
                readOnly
              />
            </div>
          </div>
          <div className="card p-4 flex-1">
            <h3 className="text-lg font-semibold mb-2">Price</h3>
            <div className="mb-2">
              <label className="block mb-1">Today's price:</label>
              <input
                type="number"
                className="border rounded px-2 py-1 w-full"
                value={eggsPriceToday}
                onChange={e => setEggsPriceToday(e.target.value)}
                min="0"
              />
            </div>
          </div>
        </div>
        {/* Summary row and Save button */}
        <div className="flex flex-col md:flex-row items-end justify-between mt-6">
          <div className="flex flex-col md:flex-row gap-8 w-full">
            <div className="flex-1">
              <h4 className="font-semibold">Live stock of Eggs:</h4>
              <div className="text-xl font-bold">{Number(liveStockEggs).toFixed(2)}</div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Stock sold:</h4>
              <div className="text-xl font-bold">{Number(stockSoldEggs).toFixed(2)}</div>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold">Total price:</h4>
              <div className="text-xl font-bold">{Number(totalPriceEggs).toFixed(2)}</div>
            </div>
          </div>
          <button
            className={getButtonClass(eggsSaved)}
            onClick={handleSaveEggs}
            disabled={eggsLoading}
            style={{ minWidth: 120 }}
          >
            {eggsSaved ? 'Saved' : eggsLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      {message && (
        <div className="mt-2 text-center text-green-700 font-medium">{message}</div>
      )}
    </div>
  );
};
 
export default Analytics;
  