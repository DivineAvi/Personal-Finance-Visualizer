"use client";

import { useState } from "react";
import { TransactionType } from "../types/Transactions";
import { useTransactionContext } from "@/context/TransactionContext";
import { CATEGORIES } from "@/types/Categories";

interface TransactionFormProps {
    onSuccess?: () => void;
    mode?: "Add" | "Edit";
    initialData?: TransactionType;
    editIndex?: string; // Changed from number to string for MongoDB _id
}

export default function TransactionForm({ 
    onSuccess, 
    mode = "Add", 
    initialData,
    editIndex 
}: TransactionFormProps) {
    const { addTransaction, editTransaction } = useTransactionContext();
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<Partial<TransactionType>>(
        initialData || {
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            description: '',
            category: ''
        }
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.amount) newErrors.amount = "Amount is required";
        if (!formData.date) newErrors.date = "Date is required";
        if (!formData.description) newErrors.description = "Description is required";
        if (!formData.category || formData.category === "none") newErrors.category = "Please select a valid category";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        if (validateForm()) {
            const transaction = formData as TransactionType;
            
            try {
                if (mode === "Edit" && editIndex !== undefined) {
                    await editTransaction(editIndex, transaction);
                } else {
                    await addTransaction(transaction);
                }
                
                // Reset form after submission
                setFormData({
                    amount: 0,
                    date: new Date().toISOString().split('T')[0],
                    description: '',
                    category: ''
                });
                
                if (onSuccess) {
                    onSuccess();
                }
            } catch (error) {
                console.error("Error submitting transaction:", error);
            }
        }
    };

    return (
        <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{mode} Transaction</h2>
            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4 w-full max-w-md border-1 rounded-md">
                <div>
                    <div className="flex justify-between items-center">
                        <label htmlFor="amount" className="font-medium">Amount</label>
                        <input 
                            type="number" 
                            name="amount" 
                            id="amount"
                            value={formData.amount || ''} 
                            onChange={handleChange}
                            className="w-1/2 p-2 border rounded" 
                            placeholder="0.00" 
                            step="0.01"
                        />
                    </div>
                    {errors.amount && <span className="text-sm text-red-500">{errors.amount}</span>}
                </div>
                
                <div>
                    <div className="flex justify-between items-center">
                        <label htmlFor="date" className="font-medium">Date</label>
                        <input 
                            type="date" 
                            name="date" 
                            id="date"
                            value={formData.date || ''} 
                            onChange={handleChange}
                            className="w-1/2 p-2 border rounded" 
                        />
                    </div>
                    {errors.date && <span className="text-sm text-red-500">{errors.date}</span>}
                </div>
                
                <div>
                    <label htmlFor="description" className="font-medium">Description</label>
                    <input 
                        type="text" 
                        name="description" 
                        id="description"
                        value={formData.description || ''} 
                        onChange={handleChange}
                        className="w-full p-2 border rounded mt-1" 
                        placeholder="Transaction description" 
                    />
                    {errors.description && <span className="text-sm text-red-500">{errors.description}</span>}
                </div>
                
                <div>
                    <div className="flex justify-between items-center">
                        <label htmlFor="category" className="font-medium">Category</label>
                        <select 
                            name="category" 
                            id="category"
                            value={formData.category || ''} 
                            onChange={handleChange}
                            className="w-1/2 p-2 border rounded"
                        >
                            <option value="">Select a category</option>
                            {CATEGORIES.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    {errors.category && <span className="text-sm text-red-500">{errors.category}</span>}
                </div>
                
                <button 
                    type="submit" 
                    className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded transition-colors"
                >
                    {mode} Transaction
                </button>
            </form>
        </div>
    );
}