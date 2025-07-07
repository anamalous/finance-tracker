import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/transaction';
import { NextResponse } from 'next/server';

async function getTransactionById(id) {
  await dbConnect();
  const transaction = await Transaction.findById(id);
  return transaction;
}

// GET a single transaction by ID 
export async function GET(request, { params }) {
  const { id } = params;

  try {
    const transaction = await getTransactionById(id);
    if (!transaction) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }
    return NextResponse.json(transaction, { status: 200 });
  } catch (error) {
    console.error(`Error fetching transaction ${id}:`, error);
    return NextResponse.json(
      { message: 'Failed to fetch transaction', error: error.message },
      { status: 500 }
    );
  }
}

// PUT a transaction by ID
export async function PUT(request, { params }) {
  const { id } = params;
  await dbConnect();

  try {
    const body = await request.json();

    if (body.amount !== undefined && typeof body.amount !== 'number') {
      return NextResponse.json({ message: 'Amount must be a number' }, { status: 400 });
    }
    if (body.date !== undefined && isNaN(new Date(body.date).getTime())) {
      return NextResponse.json({ message: 'Invalid date format' }, { status: 400 });
    }
    if (body.type !== undefined && !['expense', 'income'].includes(body.type)) {
      return NextResponse.json({ message: 'Invalid transaction type. Must be "expense" or "income"' }, { status: 400 });
    }
  
    if (body.category !== undefined && typeof body.category !== 'string') {
        return NextResponse.json({ message: 'Category must be a string' }, { status: 400 });
    }


    const updateData = {
      ...(body.amount !== undefined && { amount: body.amount }),
      ...(body.date !== undefined && { date: new Date(body.date) }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.category !== undefined && { category: body.category }),
    };

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedTransaction) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json(updatedTransaction, { status: 200 });
  } catch (error) {
    console.error(`Error updating transaction ${id}:`, error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: 'Failed to update transaction', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE a transaction by ID
export async function DELETE(request, { params }) {
  const { id } = params;
  await dbConnect();

  try {
    const deletedTransaction = await Transaction.findByIdAndDelete(id);

    if (!deletedTransaction) {
      return NextResponse.json({ message: 'Transaction not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Transaction deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting transaction ${id}:`, error);
    return NextResponse.json(
      { message: 'Failed to delete transaction', error: error.message },
      { status: 500 }
    );
  }
}
