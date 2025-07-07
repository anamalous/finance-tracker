'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

function TransactionList({ transactions, onEdit, onDelete }) {
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction._id}> 
              <TableCell className="font-medium">
                {format(new Date(transaction.date), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell className="capitalize">{transaction.category}</TableCell>
              <TableCell className="text-right">
                <span className={transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}>
                  {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toFixed(2)}
                </span>
              </TableCell>
              <TableCell className="capitalize">{transaction.type}</TableCell>
              <TableCell className="text-right flex space-x-2 justify-end">
                <Button variant="outline" size="sm" onClick={() => onEdit(transaction)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => onDelete(transaction._id)}>Delete</Button>
              </TableCell>
            </TableRow> 
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default TransactionList;
