import IProvider from "./IProvider";

export default interface IProduct {
  _id?: string;
  name: string;
  description: string;
  categoryId: string;
  images: string[];
  price: number;
  datesAvailable: Date[];
  providerId: IProvider | string;
  isActive: boolean;
}
