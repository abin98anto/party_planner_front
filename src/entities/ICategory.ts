export default interface ICategory {
  _id?: string;
  name: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt?: Date;
}
