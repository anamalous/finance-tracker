import mongoose, { Schema } from 'mongoose';

//Transaction schema
const TransactionSchema = new Schema({
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true, maxlength: 200 },
  type: { type: String, enum: ['expense', 'income'], default: 'expense' },
  category: { type: String, required: true, default: 'Other' },
}, {
  timestamps: true,
});

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);

export default Transaction;
