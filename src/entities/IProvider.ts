export default interface IProvider {
  _id?: string;
  name: string;
  company: string;
  contact: number;
  locations: string[];
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
}
