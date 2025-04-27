import mongoose, { Schema, Document } from 'mongoose';

export interface AssetDocument extends Document {
  name: string;
  category: string;
  ticker: string;
}

const AssetSchema: Schema = new Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  ticker: { type: String, required: true },
});

export default mongoose.model<AssetDocument>('Asset', AssetSchema);
