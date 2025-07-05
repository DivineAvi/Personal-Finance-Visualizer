import React, { createContext, useState } from "react";
import { TransactionType } from "../types/Transactions";

export interface TransactionContextType {
  transactions: TransactionType[];
  addTransaction: (transaction: TransactionType) => void;
  editTransaction: (index: number, transaction: TransactionType) => void;
  deleteTransaction: (index: number) => void;
}

const TransactionContext = createContext<TransactionContextType>({
  transactions: [],
  addTransaction: () => {},
  editTransaction: () => {},
  deleteTransaction: () => {},
});

export const TransactionProvider = ({ children }: { children: React.ReactNode }): React.ReactElement => {
  // Initialize with sample data across different months
  const [transactions, setTransactions] = useState<TransactionType[]>([
    {
      date: "2023-01-15",
      amount: 120,
      description: "Grocery Shopping",
      category: "Groceries"
    },
    {
      date: "2023-02-05",
      amount: 50,
      description: "Gas Station",
      category: "Transportation"
    },
    {
      date: "2023-02-20",
      amount: 200,
      description: "Electricity Bill",
      category: "Utilities"
    },
    {
      date: "2023-03-10",
      amount: 80,
      description: "Internet Bill",
      category: "Utilities"
    },
    {
      date: "2023-04-05",
      amount: 150,
      description: "Dinner with friends",
      category: "Dining"
    },
    {
      date: "2023-05-15",
      amount: 300,
      description: "Car Repair",
      category: "Transportation"
    },
    {
      date: "2023-06-01",
      amount: 75,
      description: "Pharmacy",
      category: "Healthcare"
    },
    {
      date: "2023-07-12",
      amount: 220,
      description: "New Clothes",
      category: "Shopping"
    },
    {
      date: "2023-08-20",
      amount: 180,
      description: "Concert Tickets",
      category: "Entertainment"
    },
    {
      date: "2023-09-05",
      amount: 90,
      description: "Books",
      category: "Education"
    },
    {
      date: "2023-10-10",
      amount: 250,
      description: "Home Supplies",
      category: "Housing"
    },
    {
      date: "2023-11-25",
      amount: 400,
      description: "Flight Tickets",
      category: "Travel"
    },
    {
      date: "2023-12-15",
      amount: 350,
      description: "Holiday Gifts",
      category: "Shopping"
    }
  ]);

  const addTransaction = (transaction: TransactionType) => {
    setTransactions(prev => [...prev, transaction]);
  };

  const editTransaction = (index: number, transaction: TransactionType) => {
    setTransactions(prev =>
      prev.map((t, i) => (i === index ? transaction : t))
    );
  };

  const deleteTransaction = (index: number) => {
    setTransactions(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <TransactionContext.Provider
      value={{ transactions, addTransaction, editTransaction, deleteTransaction }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export default TransactionContext;
export const useTransactionContext = () => {
  const context = React.useContext(TransactionContext);
  if (!context) {
    throw new Error("useTransactionContext must be used within a TransactionProvider");
  }
  return context;
};