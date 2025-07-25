"use client";

import { useState } from "react";
import { useTransactionContext } from "@/context/TransactionContext";
import { getCategoryById } from "@/types/Categories";
import { TransactionType } from "@/types/Transactions";
import TransactionForm from "./TransactionForm";

interface MongoTransaction extends TransactionType {
    _id: string;
}

export default function TransactionList() {
    const { transactions, deleteTransaction, loading, error } = useTransactionContext();
    const [editingTransaction, setEditingTransaction] = useState<{ data: TransactionType; id: string } | null>(null);
    const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);
    
    const handleEdit = (transaction: MongoTransaction) => {
        const formElement = document.querySelector('.transaction-form');
        if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setEditingTransaction({
            data: {
                amount: transaction.amount,
                date: transaction.date,
                description: transaction.description,
                category: transaction.category
            },
            id: transaction._id
        });
    };
    
    const handleDelete = async (id: string) => {
        if (showConfirmDelete === id) {
            await deleteTransaction(id);
            setShowConfirmDelete(null);
        } else {
            setShowConfirmDelete(id);
        }
    };
    
    const handleCancelDelete = () => {
        setShowConfirmDelete(null);
    };
    
    const handleEditCancel = () => {
        setEditingTransaction(null);
    };
    
    const handleEditSuccess = () => {
        setEditingTransaction(null);
    };
    
    if (loading) {
        return <div className="w-full p-4 text-center">Loading transactions...</div>;
    }
    
    if (error) {
        return <div className="w-full p-4 text-center text-red-500">Error: {error}</div>;
    }
    
    return (
        <div className="w-full overflow-x-auto text-white/70 bg-white/7 rounded-2xl p-2">
            {editingTransaction && (
                <div className="absolute mb-6 p-4 rounded-lg bg-black/95 w-[300px] right-7">
                    <div className="flex justify-end items-center mb-4">
                        <button 
                            onClick={handleEditCancel}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            ✕
                        </button>
                    </div>
                    <TransactionForm 
                        mode="Edit"
                        initialData={editingTransaction.data}
                        editIndex={editingTransaction.id}
                        onSuccess={handleEditSuccess}
                    />
                </div>
            )}
            
            <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse ">
                    <thead className="bg-black/20">
                        <tr className="border-b border-white/20">
                            <th className="p-2 text-left">Date</th>
                            <th className="p-2 text-left">Amount</th>
                            <th className="p-2 text-left">Description</th>
                            <th className="p-2 text-left">Category</th>
                            <th className="p-2 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-4 text-center">No transactions found</td>
                            </tr>
                        ) : (
                            transactions.map((transaction) => {
                                const mongoTransaction = transaction as MongoTransaction;
                                const category = getCategoryById(mongoTransaction.category);
                                return (
                                    <tr key={mongoTransaction._id} className="border-b border-white/9 hover:bg-white/5 whitespace-nowrap">
                                        <td className="p-2">{mongoTransaction.date}</td>
                                        <td className="p-2">${mongoTransaction.amount.toFixed(2)}</td>
                                        <td className="p-2">{mongoTransaction.description}</td>
                                        <td className="p-2">
                                            <span 
                                                className="inline-block px-2 py-1 rounded-full text-xs font-medium"
                                                style={{ 
                                                    backgroundColor: `${category.color}20`, 
                                                    color: category.color 
                                                }}
                                            >
                                                {category.name}
                                            </span>
                                        </td>
                                        <td className="p-2">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleEdit(mongoTransaction)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                    title="Edit"
                                                >
                                                    ✎
                                                </button>
                                                
                                                {showConfirmDelete === mongoTransaction._id ? (
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleDelete(mongoTransaction._id)}
                                                            className="text-red-600 hover:text-red-800"
                                                            title="Confirm Delete"
                                                        >
                                                            ✓
                                                        </button>
                                                        <button
                                                            onClick={handleCancelDelete}
                                                            className="text-gray-600 hover:text-gray-800"
                                                            title="Cancel"
                                                        >
                                                            ✕
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleDelete(mongoTransaction._id)}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Delete"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}