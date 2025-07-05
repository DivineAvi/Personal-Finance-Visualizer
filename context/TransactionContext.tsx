"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { TransactionType } from "../types/Transactions";

export interface TransactionContextType {
  transactions: TransactionType[];
  addTransaction: (transaction: TransactionType) => Promise<void>;
  editTransaction: (id: string, transaction: TransactionType) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const TransactionContext = createContext<TransactionContextType>({
  transactions: [],
  addTransaction: async () => {},
  editTransaction: async () => {},
  deleteTransaction: async () => {},
  loading: false,
  error: null,
});

export const TransactionProvider = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  const [transactions, setTransactions] = useState<(TransactionType & { _id?: string })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/transactions');
        const result = await response.json();
        
        if (result.success) {
          setTransactions(result.data);
        } else {
          setError('Failed to fetch transactions');
        }
      } catch (err) {
        setError('Error connecting to the server');
        console.error('Error fetching transactions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const addTransaction = async (transaction: TransactionType) => {
    try {
      setLoading(true);
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTransactions(prev => [...prev, result.data]);
      } else {
        setError('Failed to add transaction');
      }
    } catch (err) {
      setError('Error connecting to the server');
      console.error('Error adding transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  const editTransaction = async (id: string, transaction: TransactionType) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transaction),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTransactions(prev =>
          prev.map(t => (t._id === id ? result.data : t))
        );
      } else {
        setError('Failed to update transaction');
      }
    } catch (err) {
      setError('Error connecting to the server');
      console.error('Error updating transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTransactions(prev => prev.filter(t => t._id !== id));
      } else {
        setError('Failed to delete transaction');
      }
    } catch (err) {
      setError('Error connecting to the server');
      console.error('Error deleting transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TransactionContext.Provider
      value={{ 
        transactions, 
        addTransaction, 
        editTransaction, 
        deleteTransaction,
        loading,
        error
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export default TransactionContext;
export const useTransactionContext = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error("useTransactionContext must be used within a TransactionProvider");
  }
  return context;
};