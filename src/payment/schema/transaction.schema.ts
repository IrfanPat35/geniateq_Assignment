import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
    collection: 'transactions',
    timestamps: true,
  })
  export class Transaction {
    @Prop({ required: true })
    fullAmount: number;
    
    @Prop({ required: true })
    merchantAmount: number;

    @Prop({ required: true })
    userAmount: number;

    @Prop({ required: true })
    commissionAmount: number;

    @Prop({ required: true })
    userId: string;

    @Prop({ required: true, unique: true })
    transactionId: string;

  }
  
  export type TransactionDocument = Transaction & Document;
  export const TransactionSchema = SchemaFactory.createForClass(Transaction);
