"use client";

import { useTransactionContext } from "@/context/TransactionContext";

export default function TransactionList() {
    const { transactions } = useTransactionContext();
    
    return (
        <div className="w-full">
            <table className="w-full border-collapse border-1">
                <thead className="bg-gray-200">
                    <tr className="border-b-2 ">
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Description</th>
                        <th>Category</th>
                    </tr>
                </thead>
                <tbody className="text-center">
                    {transactions.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="py-4">No transactions found</td>
                        </tr>
                    ) : (
                        transactions.map((transaction, index) => (
                            <tr key={index}>
                                <td>{transaction.date}</td>
                                <td>${transaction.amount.toFixed(2)}</td>
                                <td>{transaction.description}</td>
                                <td>{transaction.category}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}