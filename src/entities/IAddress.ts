export default interface IAddress {
  _id?: string;
  userId: string;
  venue: string;
  place: string;
  landmark: string;
  city: string;
  district: string;
  state: string;
  pincode: number;
  phone: number;
  isDeleted: boolean;
}
