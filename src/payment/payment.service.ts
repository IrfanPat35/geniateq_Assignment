import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as jwt from 'jsonwebtoken';
import { Transaction } from './schema/transaction.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PaymentService {
    private readonly merchantPercentage = parseFloat(process.env.MERCHANT_PERCENTAGE);
    private readonly userPercentage = parseFloat(process.env.USER_PERCENTAGE);
    private readonly commissionPercentage = parseFloat(process.env.COMMISSION_PERCENTAGE);

    constructor(@InjectModel(Transaction.name) private transactionModel: Model<Transaction>) { }

    verifyToken(token: string): boolean {
        try {
            jwt.verify(token, 'SECRET_KEY');
            return true;
        } catch (e) {
            return false;
        }
    }

    async processPayment(token: string, amount: number, user: string) {
        if (!this.verifyToken(token)) {
            throw new Error('Invalid token');
        }

        const merchantAmount = amount * this.merchantPercentage;
        const userAmount = amount * this.userPercentage;
        const commissionAmount = amount * this.commissionPercentage;

        // Generate a unique transaction ID
        const transactionId = `txn_${Date.now()}`;

        // Save transaction entry in the database
        const transaction = new this.transactionModel({
            fullAmount: amount,
            merchantAmount,
            userAmount,
            commissionAmount,
            userId: user,
            transactionId,
        });
        await transaction.save();

        return {
            fullAmount: amount,
            merchantAmount,
            userAmount,
            commissionAmount,
            transactionId,
        };
    }

    @Cron(CronExpression.EVERY_HOUR) // Run this job every hour
    transferFunds() {
        // Dummy transfer logic
        console.log('Transferring funds to merchant, user, and commission accounts');
    }
}
