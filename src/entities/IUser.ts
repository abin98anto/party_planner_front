export default interface IUser {
  _id?: string;
  name: string;
  email: string;
  password: string;
  picture: string;
  isActive: boolean;
  isAdmin: boolean;
}
