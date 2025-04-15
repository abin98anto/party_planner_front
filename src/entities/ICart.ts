export interface ISelectedProducts {
  productId: string;
  selectedDates: Date[];
  locationId: string;
}

export default interface ICart {
  _id?: string;
  userId: string;
  products: ISelectedProducts[];
  createdAt?: Date;
  updatedAt?: Date;
}
