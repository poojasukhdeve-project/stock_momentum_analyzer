import React, {useEffect, useState} from 'react';
import axios from 'axios';
import SymbolSearch from '../components/SymbolSearch';
import PriceChart from '../components/PriceChart';
import MomentumCard from '../components/MomentumCard';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function DashboardPage({selectedSymbol, onSymbolChange}) {
  const [candles, setCandles] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(()=>{
    async function fetchAll(){
      try{
        const candlesRes = await axios.get(`${API}/api/stocks/${selectedSymbol}`);
        const summaryRes = await axios.get(`${API}/api/stocks/${selectedSymbol}/summary?range=90`);
        setCandles(candlesRes.data || []);
        setSummary(summaryRes.data || null);
      }catch(e){ console.error(e); }
    }
    fetchAll();
  },[selectedSymbol]);

  return (
    <div style={{maxWidth:1000, margin:'0 auto', padding:20}}>
      <h1>Stock Momentum Analyzer</h1>
      <SymbolSearch value={selectedSymbol} onChange={onSymbolChange}/>
      <MomentumCard summary={summary}/>
      <PriceChart candles={candles}/>
    </div>
  );
}
