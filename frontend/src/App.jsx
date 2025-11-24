import React, {useState} from 'react';
import DashboardPage from './pages/DashboardPage';
export default function App(){
  const [symbol, setSymbol] = useState('AAPL');
  return <DashboardPage selectedSymbol={symbol} onSymbolChange={setSymbol} />;
}
