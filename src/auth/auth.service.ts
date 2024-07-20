import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as twilio from 'twilio';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { User } from './schema/user.schema';

@Injectable()
export class AuthService {
  private twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async generateOtp(phone: string): Promise<string> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
    await this.twilioClient.messages.create({
      body: `Your OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });
  } catch (error) {
    console.error('Failed to send OTP:', error);
    throw new Error('Failed to send OTP');
  }
    const salt = await bcrypt.genSalt();
    const hashedOtp = await bcrypt.hash(otp, salt);

    await this.userModel.updateOne({ phone }, { phone, otp: hashedOtp }, { upsert: true });

    return otp;
  }

  async verifyOtp(phone: string, otp: string): Promise<string> {
    const user = await this.userModel.findOne({ phone });
    if (!user || !(await bcrypt.compare(otp, user.otp))) {
      throw new Error('Invalid OTP');
    }

    const token = jwt.sign({ phone: user.phone }, process.env.SECRET_KEY, { expiresIn: '1h' });
    return token;
  }
}
