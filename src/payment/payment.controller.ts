import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentDto } from './dto/payment.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('process')
  processPayment(@Body() paymentDto: PaymentDto) {
    const { token, amount, user } = paymentDto;
    return this.paymentService.processPayment(token, amount, user);
  }
}
