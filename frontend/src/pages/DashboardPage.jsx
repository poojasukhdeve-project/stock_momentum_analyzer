// frontend/src/pages/DashboardPage.jsx
import React, {useEffect, useState} from 'react';
import axios from 'axios';
import SymbolSearch from '../components/SymbolSearch';
import PriceChart from '../components/PriceChart';
import MomentumCard from '../components/MomentumCard';

const API = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

export default function DashboardPage({selectedSymbol, onSymbolChange}) {
  const [candles, setCandles] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    let mounted = true;
    async function fetchAll(){
      setLoading(true);
      try{
        const candlesRes = await axios.get(`${API}/api/stocks/${selectedSymbol}`);
        // request a smaller range if you have only a few rows available
        const summaryRes = await axios.get(`${API}/api/stocks/${selectedSymbol}/summary?range=90`);
        if (!mounted) return;
        setCandles(candlesRes.data || []);
        setSummary(summaryRes.data || null);
      }catch(e){
        console.error(e);
        if (mounted) {
          setCandles([]);
          setSummary(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchAll();
    return () => { mounted = false; };
  },[selectedSymbol]);

  return (
    <div style={{maxWidth:1000, margin:'0 auto', padding:20}}>
      <h1>Stock Momentum Analyzer</h1>
      <SymbolSearch value={selectedSymbol} onChange={onSymbolChange}/>

      {/* summary card: show message when summary is null */}
      { summary === null
        ? <div style={{margin:'12px 0', color:'#666'}}>Summary not available (not enough data).</div>
        : <MomentumCard summary={summary} />
      }

      {/* price chart: show chart when we have data, otherwise loading message */}
      { loading
        ? <div style={{marginTop:12}}>Loading chart data…</div>
        : (candles && candles.length > 0
            ? <PriceChart candles={candles} />
            : <div style={{marginTop:12, color:'#666'}}>No chart data available for this symbol.</div>
          )
      }
    </div>
  );
}
