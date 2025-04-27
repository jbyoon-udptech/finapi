import mongoose, { Schema, Document } from 'mongoose';

interface PortfolioAsset {
  asset_id: string;
  name: string;
  ticker: string;
  quantity: number;
  value: number;
  unit: string;
}

export interface PortfolioSnapshotDocument extends Document {
  portfolio_id: mongoose.Types.ObjectId;
  date: Date;
  assets: PortfolioAsset[];
  total_portfolio_value: number;
  total_portfolio_unit: string;
  timestamp: Date;
}

const PortfolioSnapshotSchema: Schema = new Schema({
  portfolio_id: { type: Schema.Types.ObjectId, ref: 'Portfolio', required: true },
  date: { type: Date, required: true },
  assets: [
    {
      asset_id: { type: String, required: true },
      name: { type: String, required: true },
      ticker: { type: String, required: true },
      quantity: { type: Number, required: true },
      value: { type: Number, required: true },
      unit: { type: String, required: true },
    },
  ],
  total_portfolio_value: { type: Number, required: true },
  total_portfolio_unit: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.model<PortfolioSnapshotDocument>('PortfolioSnapshot', PortfolioSnapshotSchema);
