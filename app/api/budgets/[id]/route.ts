import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Budget from '@/models/Budget';
interface Params {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: Params) {
  try {
    await dbConnect();
    const { id } = await params;
    const budget = await Budget.findById(id);
    
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
    const { id } = await params;
    const budget = await Budget.findByIdAndUpdate(
      id,
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
    const { id } = await params;
    const budget = await Budget.findByIdAndDelete(id);
    
    if (!budget) {
      return NextResponse.json({ success: false, error: 'Budget not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete budget' }, { status: 500 });
  }
} 