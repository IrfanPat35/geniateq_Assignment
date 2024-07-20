import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/auth/schema/user.schema';
import { Transaction, TransactionSchema } from './schema/transaction.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: User.name, schema: UserSchema },
    { name: Transaction.name, schema: TransactionSchema },
  ])],
  providers: [PaymentService],
  controllers: [PaymentController]
})
export class PaymentModule {}
