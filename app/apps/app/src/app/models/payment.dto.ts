import { Type } from 'class-transformer';

export class PaymentDto {

  id: string;

  status: string;

  amount: number;

  amountRefunded: number;

  currency: string;

  @Type(() => Date)
  createdAt: Date;

  paid: boolean;

  refunded: boolean;

  card: {
    brand: string;
    last4: string;
  };
}
