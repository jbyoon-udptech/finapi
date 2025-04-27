import mongoose, { Schema, Document } from 'mongoose';

export interface PortfolioDocument extends Document {
  name: string;
  created_at: Date;
}

const PortfolioSchema: Schema = new Schema({
  name: { type: String, required: true },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.model<PortfolioDocument>('Portfolio', PortfolioSchema);
