import { ISelectedProducts } from "./ICart";

export default interface IOrder {
  _id?: string;
  userId: string;
  productIds: ISelectedProducts[];
  providerIds: string[];
  amount: number;
  address: string;
}
