"use client";

import { useTransactionContext } from "@/context/TransactionContext";
import { useMemo, useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from "recharts";

type MonthlyExpense = {
  month: string;
  amount: number;
};

export default function MonthlyExpensesChart() {
  const { transactions, loading } = useTransactionContext();
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [chartData, setChartData] = useState<MonthlyExpense[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const barColor = "#8884d8";
  const activeBarColor = "#6366f1";
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="bg-black/60 border border-indigo-500/30 rounded-md p-4 shadow-xl backdrop-blur-md">
          <div className="flex flex-col gap-1">
            <p className="text-gray-400 text-xs font-medium">Month</p>
            <p className="text-white font-semibold text-base">{label}</p>
            <div className="h-px bg-gradient-to-r from-indigo-500/20 via-indigo-500/60 to-indigo-500/20 my-2"></div>
            <p className="text-gray-400 text-xs font-medium">Expenses</p>
            <p className="text-indigo-400 font-bold text-lg">${value.toFixed(2)}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  useEffect(() => {
    const monthlyExpenses: Record<string, number> = {};
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    months.forEach(month => {
      monthlyExpenses[month] = 0;
    });
    
    if (transactions && transactions.length > 0) {
      transactions.forEach(transaction => {
        try {
          const date = new Date(transaction.date);
          const year = date.getFullYear();
          
          if (year === selectedYear) {
            const monthName = months[date.getMonth()];
            monthlyExpenses[monthName] += Number(transaction.amount);
          }
        } catch (error) {
          console.error("Error processing transaction:", error, transaction);
        }
      });
    }
    
    const data = months.map(month => ({
      month,
      amount: monthlyExpenses[month]
    }));
    
    setChartData(data);
    setActiveIndex(null);
  }, [transactions, selectedYear]);

  const totalYearlyExpenses = useMemo(() => {
    return chartData.reduce((total, item) => total + item.amount, 0);
  }, [chartData]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    
    years.add(currentYear);
    
    if (transactions && transactions.length > 0) {
      transactions.forEach(transaction => {
        try {
          const year = new Date(transaction.date).getFullYear();
          if (!isNaN(year)) {
            years.add(year);
          }
        } catch (error) {
          console.error("Error extracting year:", error, transaction);
        }
      });
    }
    
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions, currentYear]);

  const handleBarClick = (data: any, index: number) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  const handleChartClick = (data: any) => {
    if (data && typeof data.activeTooltipIndex === 'number') {
      handleBarClick(data, data.activeTooltipIndex);
    }
  };

  if (loading) {
    return (
      <div className="w-full p-4 border rounded-lg shadow-sm bg-white">
        <div className="flex justify-center items-center h-80">
          <p>Loading chart data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 rounded-lg shadow-sm bg-white/5 text-white relative">
        <div className="md:hidden absolute w-full bg-gradient-to-r from-black via-transparent to-black h-full top-0 left-0 pointer-events-none"></div>
     
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Monthly Expenses</h2>
        <div className="flex items-center gap-4">
          <div>
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="p-2 border rounded outline-none border-white/10 bg-black/20"
            >
              {availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="text-sm font-medium">
            Total: <span className="text-indigo-400">${totalYearlyExpenses.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5
            }}
            onClick={handleChartClick}
          >
            <CartesianGrid strokeDasharray="2 2" stroke="#ffffff30" />
            <XAxis dataKey="month" stroke="#ffffff80" />
            <YAxis stroke="#ffffff80" width={window.screen.width<600?15:50}/>
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            />
            <Legend wrapperStyle={{ color: '#ffffff' }} />
            <Bar 
              dataKey="amount" 
              name="Expenses" 
              radius={[4, 4, 0, 0]}
              strokeWidth={0}
              cursor="pointer"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === activeIndex ? activeBarColor : barColor}
                  style={{ 
                    filter: index === activeIndex 
                      ? 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.8))' 
                      : 'none',
                    transition: 'fill 0.3s, filter 0.3s'
                  }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 