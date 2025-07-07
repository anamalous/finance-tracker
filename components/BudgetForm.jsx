'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns'; 

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { EXPENSE_CATEGORIES } from '@/lib/categories';

const budgetFormSchema = z.object({
  category: z.string().min(1, { message: "Category is required" }),
  amount: z.coerce.number().min(0.01, { message: "Amount must be positive" }),
  month: z.coerce.number().min(1).max(12, { message: "Month must be between 1 and 12" }),
  year: z.coerce.number().min(2000, { message: "Year must be 2000 or later" }),
});

function BudgetForm({ onSuccess, initialData }) {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const form = useForm({
    resolver: zodResolver(budgetFormSchema),
    defaultValues: {
      category: initialData?.category || EXPENSE_CATEGORIES[0],
      amount: initialData?.amount || 0.01,
      month: initialData?.month || currentMonth,
      year: initialData?.year || currentYear,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        category: initialData.category,
        amount: initialData.amount,
        month: initialData.month,
        year: initialData.year,
      });
    } else {
      form.reset({
        category: EXPENSE_CATEGORIES[0],
        amount: 0.01,
        month: currentMonth,
        year: currentYear,
      });
    }
  }, [initialData, form, currentMonth, currentYear]);

  const onSubmit = async (values) => {
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save budget');
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving budget:", error);
      form.setError("root.serverError", {
        message: error.message || "An unexpected error occurred."
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
       
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Budget Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="month"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Month</FormLabel>
              <Select onValueChange={field.onChange} value={String(field.value)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select month" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((monthNum) => (
                    <SelectItem key={monthNum} value={String(monthNum)}>
                      {format(new Date(currentYear, monthNum - 1, 1), 'MMMM')} 
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="year"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year</FormLabel>
              <Select onValueChange={field.onChange} value={String(field.value)}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((yearNum) => ( 
                    <SelectItem key={yearNum} value={String(yearNum)}>
                      {yearNum}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {form.formState.errors.root?.serverError && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.root.serverError.message}
          </p>
        )}

        <Button type="submit" className="w-full">
          Set Budget
        </Button>
      </form>
    </Form>
  );
}

export default BudgetForm;
