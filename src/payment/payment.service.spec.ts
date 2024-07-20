import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from './payment.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from './schema/transaction.schema';

describe('PaymentService', () => {
  let service: PaymentService;
  let transactionModel: Model<Transaction>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: getModelToken('Transaction'),
          useValue: Model,
        },
      ],
    }).compile();

    service = module.get<PaymentService>(PaymentService);
    transactionModel = module.get<Model<Transaction>>(getModelToken('Transaction'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should process payment and save transaction', async () => {
    const token = 'valid_token';
    const amount = 1000;
    const user = 'user_id';

    jest.spyOn(service, 'verifyToken').mockImplementation(() => true);
    jest.spyOn(transactionModel.prototype, 'save').mockResolvedValue({
      fullAmount: amount,
      merchantAmount: amount * 0.5,
      userAmount: amount * 0.4,
      commissionAmount: amount * 0.1,
      userId: user,
      transactionId: `txn_${Date.now()}`,
    } as any);

    const result = await service.processPayment(token, amount, user);

    expect(result).toEqual({
      fullAmount: amount,
      merchantAmount: amount * 0.5,
      userAmount: amount * 0.4,
      commissionAmount: amount * 0.1,
      transactionId: expect.any(String),
    });
  });
});
