'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import Dashboard from '@/components/Dashboard';
import BudgetForm from '@/components/BudgetForm';

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]); 
  const [loadingTransactions, setLoadingTransactions] = useState(true);
  const [loadingBudgets, setLoadingBudgets] = useState(true);
  const [error, setError] = useState(null);
  const [isTransactionFormDialogOpen, setIsTransactionFormDialogOpen] = useState(false);
  const [isBudgetFormDialogOpen, setIsBudgetFormDialogOpen] = useState(false); 
  const [editingTransaction, setEditingTransaction] = useState(null);

  const fetchTransactions = useCallback(async () => {
    setLoadingTransactions(true);
    setError(null);
    try {
      const response = await fetch('/api/transactions');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTransactions(data);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
      setError("Failed to load transactions. Please try again.");
    } finally {
      setLoadingTransactions(false);
    }
  }, []);

  const fetchBudgets = useCallback(async () => {
    setLoadingBudgets(true);
    setError(null);
    try {
      const response = await fetch('/api/budgets');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setBudgets(data);
    } catch (err) {
      console.error("Failed to fetch budgets:", err);
      setError("Failed to load budgets. Please try again.");
    } finally {
      setLoadingBudgets(false);
    }
  }, []);

  // Fetch data on component mount
  useEffect(() => {
    fetchTransactions();
    fetchBudgets();
  }, [fetchTransactions, fetchBudgets]);

  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setIsTransactionFormDialogOpen(true);
  };

  const handleTransactionFormSuccess = () => {
    fetchTransactions(); 
    setIsTransactionFormDialogOpen(false); 
    setEditingTransaction(null); 
  };

  const handleBudgetFormSuccess = () => {
    fetchBudgets();
    setIsBudgetFormDialogOpen(false);
  };

  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }
    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchTransactions(); // update list
    } catch (err) {
      console.error("Failed to delete transaction:", err);
      setError("Failed to delete transaction. Please try again.");
    }
  };

  const isLoading = loadingTransactions || loadingBudgets;

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">Personal Finance Tracker</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            {error}
          </div>
        )}

        <div className="flex justify-end space-x-4 mb-6">
          <Dialog open={isTransactionFormDialogOpen} onOpenChange={setIsTransactionFormDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingTransaction(null)}>Add New Transaction</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</DialogTitle>
              </DialogHeader>
              <TransactionForm 
                onSuccess={handleTransactionFormSuccess} 
                initialData={editingTransaction} 
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isBudgetFormDialogOpen} onOpenChange={setIsBudgetFormDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Set Budget</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Set Monthly Budget</DialogTitle>
              </DialogHeader>
              <BudgetForm onSuccess={handleBudgetFormSuccess} />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-600">Loading dashboard data...</p>
        ) : (
          <Dashboard transactions={transactions} budgets={budgets} />
        )}

        <section className="mt-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">All Transactions</h2>
          {isLoading ? (
            <p className="text-center text-gray-600">Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <p className="text-center text-gray-600">No transactions yet. Add one to get started!</p>
          ) : (
            <TransactionList 
              transactions={transactions} 
              onEdit={handleEditClick} 
              onDelete={handleDelete} 
            />
          )}
        </section>
      </div>
    </main>
  );
}
