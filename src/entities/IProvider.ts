export default interface IProvider {
  _id?: string;
  name: string;
  company: string;
  contact: number;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
}
