import mongoose, { Schema } from 'mongoose';

//Budget schema
const BudgetSchema = new Schema({
  category: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true, min: 2000 },
}, {
  timestamps: true,
});

BudgetSchema.index({ category: 1, month: 1, year: 1 }, { unique: true });

const Budget = mongoose.models.Budget || mongoose.model('Budget', BudgetSchema);

export default Budget;
