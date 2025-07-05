import mongoose from 'mongoose';

const BudgetSchema = new mongoose.Schema({
  categoryId: {
    type: String,
    required: [true, 'Category ID is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
  },
  month: {
    type: Number,
    required: [true, 'Month is required'],
    min: 0,
    max: 11,
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a compound index for unique budget per category, month, and year
BudgetSchema.index({ categoryId: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.models.Budget || mongoose.model('Budget', BudgetSchema); 