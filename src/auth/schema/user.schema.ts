import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  collection: 'user',
  timestamps: true,
})
export class User {
  @Prop({ required: true, unique: true })
  phone: string;
  
  @Prop({ required: true })
  otp: string;
}

export type UserDocument = User & Document;
export const UserSchema = SchemaFactory.createForClass(User);
