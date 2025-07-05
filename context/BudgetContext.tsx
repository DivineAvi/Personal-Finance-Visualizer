"use client";

import React, { createContext, useState, useContext, useEffect } from "react";
import { BudgetType, createBudgetId } from "../types/Budget";

export interface BudgetContextType {
  budgets: BudgetType[];
  addBudget: (budget: Omit<BudgetType, "id">) => Promise<void>;
  updateBudget: (budget: BudgetType) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  getBudget: (categoryId: string, month: number, year: number) => BudgetType | undefined;
  loading: boolean;
  error: string | null;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export const BudgetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [budgets, setBudgets] = useState<(BudgetType & { _id?: string })[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch budgets from API
  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/budgets');
        const result = await response.json();
        
        if (result.success) {
          // Transform MongoDB _id to id for compatibility with existing code
          const transformedBudgets = result.data.map((budget: any) => ({
            ...budget,
            id: budget._id
          }));
          setBudgets(transformedBudgets);
        } else {
          setError('Failed to fetch budgets');
        }
      } catch (err) {
        setError('Error connecting to the server');
        console.error('Error fetching budgets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  const addBudget = async (budget: Omit<BudgetType, "id">) => {
    try {
      setLoading(true);
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budget),
      });
      
      const result = await response.json();
      
      if (result.success) {
        const newBudget = {
          ...result.data,
          id: result.data._id
        };
        
        // Replace existing budget or add new one
        setBudgets(prev => {
          const existingIndex = prev.findIndex(b => 
            b.categoryId === budget.categoryId && 
            b.month === budget.month && 
            b.year === budget.year
          );
          
          if (existingIndex >= 0) {
            const newBudgets = [...prev];
            newBudgets[existingIndex] = newBudget;
            return newBudgets;
          } else {
            return [...prev, newBudget];
          }
        });
      } else {
        setError('Failed to add budget');
      }
    } catch (err) {
      setError('Error connecting to the server');
      console.error('Error adding budget:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateBudget = async (budget: BudgetType) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/budgets/${budget.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(budget),
      });
      
      const result = await response.json();
      
      if (result.success) {
        setBudgets(prev => 
          prev.map(b => b.id === budget.id ? { ...result.data, id: result.data._id } : b)
        );
      } else {
        setError('Failed to update budget');
      }
    } catch (err) {
      setError('Error connecting to the server');
      console.error('Error updating budget:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setBudgets(prev => prev.filter(b => b.id !== id));
      } else {
        setError('Failed to delete budget');
      }
    } catch (err) {
      setError('Error connecting to the server');
      console.error('Error deleting budget:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBudget = (categoryId: string, month: number, year: number) => {
    return budgets.find(b => 
      b.categoryId === categoryId && 
      b.month === month && 
      b.year === year
    );
  };

  return (
    <BudgetContext.Provider
      value={{ 
        budgets, 
        addBudget, 
        updateBudget, 
        deleteBudget, 
        getBudget,
        loading,
        error
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudgetContext = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("useBudgetContext must be used within a BudgetProvider");
  }
  return context;
}; 