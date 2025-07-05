import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Budget from '@/models/Budget';

export async function GET() {
  try {
    await dbConnect();
    const budgets = await Budget.find({}).sort({ year: -1, month: -1 });
    return NextResponse.json({ success: true, data: budgets });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await dbConnect();
    
    // Check if a budget already exists for this category, month, and year
    const existingBudget = await Budget.findOne({
      categoryId: body.categoryId,
      month: body.month,
      year: body.year
    });
    
    let budget;
    if (existingBudget) {
      // Update existing budget
      budget = await Budget.findByIdAndUpdate(
        existingBudget._id,
        { amount: body.amount },
        { new: true, runValidators: true }
      );
    } else {
      // Create new budget
      budget = await Budget.create(body);
    }
    
    return NextResponse.json({ success: true, data: budget }, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating budget:', error);
    return NextResponse.json({ success: false, error: 'Failed to create/update budget' }, { status: 500 });
  }
} 