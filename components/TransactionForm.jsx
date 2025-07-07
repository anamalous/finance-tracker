'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/lib/categories';

const formSchema = z.object({
  amount: z.coerce.number().min(1, { message: "Amount must be positive" }),
  date: z.string().refine(val => !isNaN(new Date(val).getTime()), {
    message: "Invalid date format. Please use YYYY-MM-DD."
  }).optional(),
  description: z.string().min(1, { message: "Description is required" }).max(200, { message: "Description too long" }),
  type: z.enum(["expense", "income"], { message: "Type must be 'expense' or 'income'" }),
  category: z.string().min(1, { message: "Category is required" }),
});

function TransactionForm({ onSuccess, initialData }) {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: initialData?.amount || 1,
      date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
      description: initialData?.description || '',
      type: initialData?.type || 'expense',
      category: initialData?.category || 'Other',
    },
  });

  const transactionType = form.watch('type');
  const availableCategories = transactionType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  useEffect(() => {
    if (initialData) {
      form.reset({
        amount: initialData.amount,
        date: new Date(initialData.date).toISOString().split('T')[0],
        description: initialData.description,
        type: initialData.type,
        category: initialData.category,
      });
    } else {
      form.reset({
        amount: 0.01,
        date: '',
        description: '',
        type: 'expense',
        category: 'Other',
      });
    }
  }, [initialData, form]);

  useEffect(() => {
    if (transactionType === 'expense') {
      form.setValue('category', 'Other');
    } else {
      form.setValue('category', 'Salary');
    }
  }, [transactionType, form]);


  const onSubmit = async (values) => {
    try {
      const method = initialData ? 'PUT' : 'POST';
      const url = initialData ? `/api/transactions/${initialData._id}` : '/api/transactions';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save transaction');
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving transaction:", error);
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="expense" />
                    <Label htmlFor="expense">Expense</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="income" id="income" />
                    <Label htmlFor="income">Income</Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  {availableCategories.map((category) => (
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

        {form.formState.errors.root?.serverError && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.root.serverError.message}
          </p>
        )}

        <Button type="submit" className="w-full">
          {initialData ? 'Save Changes' : 'Add Transaction'}
        </Button>
      </form>
    </Form>
  );
}

export default TransactionForm;
