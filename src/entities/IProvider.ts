import ILocation from "./ILocation";

export default interface IProvider {
  _id?: string;
  name: string;
  company: string;
  contact: number;
  locations: ILocation[];
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
}
