import dbConnect from '@/lib/mongodb';
import Budget from '@/models/Budget';
import { NextResponse } from 'next/server';

// GET all budgets
export async function GET() {
  await dbConnect();

  try {
    const budgets = await Budget.find({}).sort({ year: -1, month: -1, category: 1 });
    return NextResponse.json(budgets, { status: 200 });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { message: 'Failed to fetch budgets', error: error.message },
      { status: 500 }
    );
  }
}

// POST a new budget or update an existing one 
export async function POST(request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { category, amount, month, year } = body;

    if (!category || typeof amount !== 'number' || !month || !year) {
      return NextResponse.json(
        { message: 'Missing required fields: category, amount, month, year' },
        { status: 400 }
      );
    }
    if (amount < 0) {
      return NextResponse.json({ message: 'Budget amount cannot be negative' }, { status: 400 });
    }
    if (month < 1 || month > 12) {
      return NextResponse.json({ message: 'Month must be between 1 and 12' }, { status: 400 });
    }
    if (year < 2000) { // Arbitrary minimum year
      return NextResponse.json({ message: 'Year must be 2000 or later' }, { status: 400 });
    }

    const filter = { category, month, year };
    const update = { amount };
    const options = {
      new: true, 
      upsert: true,
      runValidators: true,
    };

    const budget = await Budget.findOneAndUpdate(filter, update, options);

    return NextResponse.json(budget, { status: 201 }); 
  } catch (error) {
    console.error('Error saving budget:', error);
    if (error.code === 11000) {
      return NextResponse.json({ message: 'Budget for this category, month, and year already exists.' }, { status: 409 });
    }
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: 'Failed to save budget', error: error.message },
      { status: 500 }
    );
  }
}
