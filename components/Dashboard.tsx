"use client";

import { useTransactionContext } from "@/context/TransactionContext";
import { getCategoryById } from "@/types/Categories";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

export default function Dashboard() {
  const { transactions } = useTransactionContext();
  
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [animatedMonthly, setAnimatedMonthly] = useState(0);
  const [animatedAverage, setAnimatedAverage] = useState(0);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  const summaryCardsRef = useRef<HTMLDivElement>(null);
  const topCategoriesRef = useRef<HTMLDivElement>(null);
  const recentTransactionsRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const totalExpenses = useMemo(() => {
    return transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [transactions]);

  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [transactions]);

  const averageMonthlyExpenses = useMemo(() => {
    return totalExpenses / (getUniqueMonthCount(transactions) || 1);
  }, [totalExpenses, transactions]);

  // Initial layout and UI animations - runs only once
  useEffect(() => {

    gsap.set(dashboardRef.current, { opacity: 0, scale: 0.98 });
    
    const masterTl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    masterTl.to(dashboardRef.current, { 
      opacity: 1, 
      scale: 1, 
      duration: 0.6,
      clearProps: "scale"
    });
    
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    
    tl.fromTo(
      summaryCardsRef.current?.children || [],
      { x: -300, opacity: 0,rotate: -20, scale: 0.8 },
      { 
        x: 0, 
        rotate: 0,
        opacity: 1, 
        scale: 1,
        stagger: 0.3, 
        duration: 0.8,
        ease: "back.out(1.2)" 
      },
      0
    );
    
    tl.fromTo(
      topCategoriesRef.current,
      { y: 300, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, stagger: 0.2, ease: "back.out(1.5)" },
      "+=0.01"
    );
    
    tl.fromTo(
      recentTransactionsRef.current,
      { x: 200, opacity: 0,rotate: 20, rotateY: 20},
      { x: 0,  opacity: 1,rotate: 0, rotateY: 0, duration: 0.8,ease: "back.out(1.2)"},
      "+=0.01"
    );
    
    tl.fromTo(
      ".category-item",
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.1, duration: 0.6 },
      0.4
    );
    
    tl.fromTo(
      ".transaction-item",
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 0.6 },
      0.5
    );
    
    tl.fromTo(
      ".total-expenses-card",
      { boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" },
      { 
        boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)", 
        repeat: 1, 
        yoyo: true, 
        duration: 1.2 
      },
      1
    );
    
    masterTl.add(tl, 0.2);
    
    if(summaryCardsRef.current){
      summaryCardsRef.current.onmousemove = (e) => {
        const rect = summaryCardsRef.current?.getBoundingClientRect();
        if(rect){
          const x = e.clientX - rect.left - rect.width/2;
          const y = e.clientY - rect.top - rect.height/2;
          gsap.to(summaryCardsRef.current, {
            rotationX: -y / 300,
            rotationY: x / 300,
            duration: 0.5,
            ease: "power2.out"
          });
        }
      }
      summaryCardsRef.current.onmouseleave = () => {
        gsap.to(summaryCardsRef.current, {
          rotationX: 0,
          rotationY: 0,
          duration: 0.5,
          ease: "power2.out"
        });
      }
    }

    if(recentTransactionsRef.current){
      recentTransactionsRef.current.onmousemove = (e) => {
        const rect = recentTransactionsRef.current?.getBoundingClientRect();
        if(rect){
        const x = e.clientX - rect.left - rect.width/2;
        const y = e.clientY - rect.top - rect.height/2;

        gsap.to(recentTransactionsRef.current, {
          rotationX: -y / 300,
          rotationY: x / 300,
          duration: 0.5,
          ease: "power2.out"
        });
        }
      }
      recentTransactionsRef.current.onmouseleave = () => {
        gsap.to(recentTransactionsRef.current, {
          rotationX: 0,
          rotationY: 0,
          duration: 0.5,
          ease: "power2.out"
        });
      }
    }
    
    setInitialLoadComplete(true);
    
    return () => {
      masterTl.kill();
      tl.kill();
    };
  }, []);
  
  useEffect(() => {
    if (!initialLoadComplete) return;
    
    const tl = gsap.timeline();
    const counterObj = { value: animatedTotal };
    
    tl.to(counterObj, {
      value: totalExpenses,
      duration: 1,
      ease: "power2.out",
      onUpdate: () => {
        setAnimatedTotal(Math.round(counterObj.value));
      }
    });
    
    return () => {
      tl.kill();
    };
  }, [totalExpenses, initialLoadComplete]);
  
  useEffect(() => {
    if (!initialLoadComplete) return;
    
    const tl = gsap.timeline();
    const counterObj = { value: animatedMonthly };
    
    tl.to(counterObj, {
      value: currentMonthExpenses,
      duration: 1,
      ease: "power2.out",
      onUpdate: () => {
        setAnimatedMonthly(Math.round(counterObj.value));
      }
    });
    
    return () => {
      tl.kill();
    };
  }, [currentMonthExpenses, initialLoadComplete]);
  
  useEffect(() => {
    if (!initialLoadComplete) return;
    
    const tl = gsap.timeline();
    const counterObj = { value: animatedAverage };
    
    tl.to(counterObj, {
      value: averageMonthlyExpenses,
      duration: 1,
      ease: "power2.out",
      onUpdate: () => {
        setAnimatedAverage(Math.round(counterObj.value));
      }
    });
    
    return () => {
      tl.kill();
    };
  }, [averageMonthlyExpenses, initialLoadComplete]);

  const previousMonthExpenses = useMemo(() => {
    const now = new Date();
    let previousMonth = now.getMonth() - 1;
    let previousMonthYear = now.getFullYear();
    
    if (previousMonth < 0) {
      previousMonth = 11;
      previousMonthYear -= 1;
    }

    return transactions
      .filter(transaction => {
        const transactionDate = new Date(transaction.date);
        return (
          transactionDate.getMonth() === previousMonth &&
          transactionDate.getFullYear() === previousMonthYear
        );
      })
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }, [transactions]);

  const monthOverMonthChange = useMemo(() => {
    if (previousMonthExpenses === 0) return 100;
    return ((currentMonthExpenses - previousMonthExpenses) / previousMonthExpenses) * 100;
  }, [currentMonthExpenses, previousMonthExpenses]);

  const topCategories = useMemo(() => {
    const categoryTotals: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      categoryTotals[transaction.category] = 
        (categoryTotals[transaction.category] || 0) + transaction.amount;
    });
    
    return Object.entries(categoryTotals)
      .map(([id, total]) => ({
        ...getCategoryById(id),
        total
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  }, [transactions]);

  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [transactions]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div ref={dashboardRef} className="grid gap-6 md:grid-cols-3 p-4 h-full overflow-hidden" style={{perspective: "200px"}}>
      <div ref={summaryCardsRef} className="grid grid-cols-1 md:grid-cols-1 gap-4">
        <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg shadow-sm text-white total-expenses-card">
          <h3 className="text-sm font-medium text-white">Total Expenses</h3>
          <p className="text-2xl font-bold mt-1">{formatCurrency(animatedTotal)}</p>
          <p className="text-xs text-white mt-2">Lifetime total</p>
        </div>
        
        <div className="p-4 bg-white/5 text-white rounded-lg shadow-sm hover:shadow-lg hover:scale-[1.32] transition-[shadow,scale] duration-300">
          <h3 className="text-sm font-medium ">This Month</h3>
          <p className="text-2xl font-bold mt-1">{formatCurrency(animatedMonthly)}</p>
          <div className="flex items-center mt-2">
            <span 
              className={`text-xs ${monthOverMonthChange >= 0 ? 'text-red-500' : 'text-green-500'}`}
            >
              {monthOverMonthChange >= 0 ? '↑' : '↓'} {Math.abs(monthOverMonthChange).toFixed(1)}%
            </span>
            <span className="text-xs ml-1">vs last month</span>
          </div>
        </div>
        
        <div className="p-4 bg-white/5 text-white rounded-lg shadow-sm ">
          <h3 className="text-sm font-medium text-gray-500">Average Monthly</h3>
          <p className="text-2xl font-bold mt-1">
            {formatCurrency(animatedAverage)}
          </p>
          <p className="text-xs text-gray-500 mt-2">Based on your history</p>
        </div>
      </div>
      
      <div ref={topCategoriesRef} className="bg-white/5 text-white rounded-lg shadow-sm p-4 ">
        <h3 className="font-medium mb-3">Top Spending Categories</h3>
        <div className="space-y-3">
          {topCategories.map(category => (
            <div key={category.id} className="flex items-center justify-between category-item">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: category.color }}
                ></div>
                <span>{category.name}</span>
              </div>
              <span className="font-medium">{formatCurrency(category.total)}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div ref={recentTransactionsRef} className="bg-white/7 text-white rounded-lg shadow-sm  p-4">
        <h3 className="font-medium mb-3 text-purple-400 border-b-1 border-white/10 pb-2">Recent Transactions</h3>
        <div className="space-y-2">
          {recentTransactions.map((transaction, index) => {
            const category = getCategoryById(transaction.category);
            return (
              <div key={index} className="flex items-center justify-between p-2 transition-all duration-300 hover:bg-white/9 rounded transaction-item">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500">{transaction.date}</span>
                    <span 
                      className="ml-2 text-xs px-2 py-0.5 rounded-full"
                      style={{ 
                        backgroundColor: `${category.color}20`, 
                        color: category.color 
                      }}
                    >
                      {category.name}
                    </span>
                  </div>
                </div>
                <span className="font-medium">{formatCurrency(transaction.amount)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getUniqueMonthCount(transactions: any[]) {
  const uniqueMonths = new Set();
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
    uniqueMonths.add(monthYear);
  });
  
  return uniqueMonths.size;
} 