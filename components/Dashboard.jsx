'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format } from 'date-fns';
import { EXPENSE_CATEGORIES } from '@/lib/categories';

const formatCurrency = (value) => {
  return `$${value.toFixed(2)}`;
};

const PIE_COLORS = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
  '#A28DFF', '#FF6B6B', '#6BFFB8', '#FFD16B', '#8E44AD', '#2ECC71', '#F1C40F', '#E67E22'
];

const BAR_COLORS = {
  budget: '#8884d8',
  actual: '#82ca9d',
};

function Dashboard({ transactions, budgets }) {
  const currentMonth = new Date().getMonth() + 1; 
  const currentYear = new Date().getFullYear();

  const { totalExpenses, totalIncome, netBalance } = useMemo(() => {
    let expenses = 0;
    let income = 0;

    transactions.forEach(t => {
      if (t.type === 'expense') {
        expenses += t.amount;
      } else if (t.type === 'income') {
        income += t.amount;
      }
    });

    return {
      totalExpenses: expenses,
      totalIncome: income,
      netBalance: income - expenses,
    };
  }, [transactions]);

  const categoryPieData = useMemo(() => {
    const expenseCategories = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        const category = t.category || 'Other';
        expenseCategories[category] = (expenseCategories[category] || 0) + t.amount;
      }
    });

    return Object.keys(expenseCategories).map(category => ({
      name: category,
      value: expenseCategories[category],
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  const monthlyExpensesData = useMemo(() => {
    const monthlyTotals = {}; // { 'YYYY-MM': totalExpense }
    transactions.forEach(t => {
      if (t.type === 'expense') {
        const monthYear = format(new Date(t.date), 'yyyy-MM');
        monthlyTotals[monthYear] = (monthlyTotals[monthYear] || 0) + t.amount;
      }
    });

    
    return Object.keys(monthlyTotals)
      .sort()
      .map(monthYear => ({
        name: format(new Date(monthYear + '-01'), 'MMM yyyy'),
        expenses: monthlyTotals[monthYear],
      }));
  }, [transactions]);

  const budgetVsActualData = useMemo(() => {
    const actualExpensesByCategory = {};
    transactions.forEach(t => {
      const transactionDate = new Date(t.date);
      if (t.type === 'expense' &&
          transactionDate.getMonth() + 1 === currentMonth &&
          transactionDate.getFullYear() === currentYear) {
        const category = t.category || 'Other';
        actualExpensesByCategory[category] = (actualExpensesByCategory[category] || 0) + t.amount;
      }
    });

    const comparisonData = [];
    const categoriesWithBudgets = new Set([...EXPENSE_CATEGORIES, ...Object.keys(actualExpensesByCategory)]);

    categoriesWithBudgets.forEach(category => {
      const budgetForCategory = budgets.find(b =>
        b.category === category && b.month === currentMonth && b.year === currentYear
      );
      const budgetedAmount = budgetForCategory ? budgetForCategory.amount : 0;
      const actualAmount = actualExpensesByCategory[category] || 0;

      if (budgetedAmount > 0 || actualAmount > 0) {
        comparisonData.push({
          name: category,
          Budget: budgetedAmount,
          Actual: actualAmount,
        });
      }
    });

    return comparisonData;
  }, [transactions, budgets, currentMonth, currentYear]);

  const spendingInsights = useMemo(() => {
    const insights = [];

    let currentMonthBudgetTotal = 0;
    let currentMonthActualExpenses = 0;

    budgets.forEach(b => {
      if (b.month === currentMonth && b.year === currentYear) {
        currentMonthBudgetTotal += b.amount;
      }
    });

    transactions.forEach(t => {
      const transactionDate = new Date(t.date);
      if (t.type === 'expense' &&
          transactionDate.getMonth() + 1 === currentMonth &&
          transactionDate.getFullYear() === currentYear) {
        currentMonthActualExpenses += t.amount;
      }
    });

    const difference = currentMonthBudgetTotal - currentMonthActualExpenses;
    if (currentMonthBudgetTotal > 0) {
      if (difference > 0) {
        insights.push(`You are ${formatCurrency(difference)} under budget this month (${format(new Date(), 'MMMM yyyy')})! 🎉`);
      } else if (difference < 0) {
        insights.push(`You are ${formatCurrency(Math.abs(difference))} over budget this month (${format(new Date(), 'MMMM yyyy')}). Consider reviewing your spending. ⚠️`);
      } else {
        insights.push(`You are exactly on budget this month (${format(new Date(), 'MMMM yyyy')}). Great job!`);
      }
    } else {
      insights.push(`Set some budgets for ${format(new Date(), 'MMMM yyyy')} to get spending insights!`);
    }

    if (categoryPieData.length > 0) {
      const topCategory = categoryPieData[0];
      insights.push(`Your top expense category is "${topCategory.name}" (${formatCurrency(topCategory.value)}) this month.`);
    }

    if (monthlyExpensesData.length >= 2) {
      const lastMonth = monthlyExpensesData[monthlyExpensesData.length - 2];
      const currentMonthData = monthlyExpensesData[monthlyExpensesData.length - 1];

      if (lastMonth && currentMonthData && lastMonth.expenses !== undefined && currentMonthData.expenses !== undefined) {
        if (currentMonthData.expenses > lastMonth.expenses) {
          insights.push(`Your spending increased by ${formatCurrency(currentMonthData.expenses - lastMonth.expenses)} from ${lastMonth.name} to ${currentMonthData.name}.`);
        } else if (currentMonthData.expenses < lastMonth.expenses) {
          insights.push(`Your spending decreased by ${formatCurrency(lastMonth.expenses - currentMonthData.expenses)} from ${lastMonth.name} to ${currentMonthData.name}.`);
        } else {
          insights.push(`Your spending remained consistent between ${lastMonth.name} and ${currentMonthData.name}.`);
        }
      }
    }


    return insights;
  }, [transactions, budgets, categoryPieData, monthlyExpensesData, currentMonth, currentYear]);


  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <span className="text-red-500">↓</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">All your spending combined</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <span className="text-green-500">↑</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">All your earnings combined</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <span>💰</span>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {formatCurrency(netBalance)}
            </div>
            <p className="text-xs text-muted-foreground">Income minus expenses</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="budget">Budget vs Actual</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`pie-cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500">No expense data to display category chart.</p>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Monthly Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {monthlyExpensesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyExpensesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="expenses" fill="#8884d8" name="Expenses" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500">No monthly expense data to display chart.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual ({format(new Date(currentYear, currentMonth -1), 'MMMM yyyy')})</CardTitle>
            </CardHeader>
            <CardContent>
              {budgetVsActualData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={budgetVsActualData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="Budget" fill={BAR_COLORS.budget} />
                    <Bar dataKey="Actual" fill={BAR_COLORS.actual} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-gray-500">No budget or actual spending data for this month. Set some budgets!</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Spending Insights</CardTitle>
            </CardHeader>
            <CardContent>
              {spendingInsights.length > 0 ? (
                <ul className="list-disc pl-5 space-y-2 text-gray-700">
                  {spendingInsights.map((insight, index) => (
                    <li key={index}>{insight}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500">Add more transactions and budgets to generate insights.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <section className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Most Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? ( 
              <div className="space-y-3">
                {transactions.slice(0, 5).map(t => (
                  <div key={t._id} className="flex justify-between items-center text-sm border-b pb-2 last:border-b-0 last:pb-0">
                    <div>
                      <p className="font-medium">{t.description}</p>
                      <p className="text-xs text-muted-foreground capitalize">{t.category} - {format(new Date(t.date), 'MMM dd')}</p>
                    </div>
                    <span className={`font-semibold ${t.type === 'expense' ? 'text-red-600' : 'text-green-600'}`}>
                      {t.type === 'expense' ? '-' : '+'}{formatCurrency(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No recent transactions.</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default Dashboard;
