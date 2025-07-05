import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Budget from '@/models/Budget';

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: Params) {
  try {
    await dbConnect();
    const budget = await Budget.findById(params.id);
    
    if (!budget) {
      return NextResponse.json({ success: false, error: 'Budget not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: budget });
  } catch (error) {
    console.error('Error fetching budget:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch budget' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const body = await request.json();
    await dbConnect();
    
    const budget = await Budget.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!budget) {
      return NextResponse.json({ success: false, error: 'Budget not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: budget });
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json({ success: false, error: 'Failed to update budget' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    await dbConnect();
    const budget = await Budget.findByIdAndDelete(params.id);
    
    if (!budget) {
      return NextResponse.json({ success: false, error: 'Budget not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete budget' }, { status: 500 });
  }
} 