"use client";

import { useTransactionContext } from "@/context/TransactionContext";
import { getCategoryById } from "@/types/Categories";

export default function TransactionList() {
    const { transactions } = useTransactionContext();
    
    return (
        <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse">
                <thead className="bg-gray-100">
                    <tr className="border-b">
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-left">Amount</th>
                        <th className="p-2 text-left">Description</th>
                        <th className="p-2 text-left">Category</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="py-4 text-center">No transactions found</td>
                        </tr>
                    ) : (
                        transactions.map((transaction, index) => {
                            const category = getCategoryById(transaction.category);
                            return (
                                <tr key={index} className="border-b hover:bg-gray-50">
                                    <td className="p-2">{transaction.date}</td>
                                    <td className="p-2">${transaction.amount.toFixed(2)}</td>
                                    <td className="p-2">{transaction.description}</td>
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
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}