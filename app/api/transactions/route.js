import dbConnect from '@/lib/mongodb';
import Transaction from '@/models/transaction';
import { NextResponse } from 'next/server';

// GET all transactions
export async function GET() {
  await dbConnect();

  try {
    const transactions = await Transaction.find({}).sort({ date: -1 });
    return NextResponse.json(transactions, { status: 200 });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { message: 'Failed to fetch transactions', error: error.message },
      { status: 500 }
    );
  }
}

// POST a new transaction
export async function POST(request) {
  await dbConnect();

  try {
    const body = await request.json();
    
    if (!body.amount || !body.description || !body.type || !body.category) {
      return NextResponse.json({ message: 'Missing required fields: amount, description, type, and category are mandatory.' }, { status: 400 });
    }
    
    if (!['expense', 'income'].includes(body.type)) {
      return NextResponse.json({ message: 'Invalid transaction type. Must be "expense" or "income"' }, { status: 400 });
    }

    let transactionDate;
    if (body.date) {
      const parsedDate = new Date(body.date);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json({ message: 'Invalid date format provided. Please use a valid date string.' }, { status: 400 });
      }
      transactionDate = parsedDate;
    } else {
      transactionDate = new Date();
    }

    const newTransaction = new Transaction({
      amount: body.amount,
      date: transactionDate,
      description: body.description,
      type: body.type,
      category: body.category,
    });

    await newTransaction.save();
    
    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: 'Failed to create transaction', error: error.message },
      { status: 500 }
    );
  }
}
