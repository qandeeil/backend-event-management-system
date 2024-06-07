import { IUser } from "./interfaces";
import UserModel from "./userModel";

class UserService {
  createUser(user: IUser) {
    return UserModel.create(user);
  }
  findUserByEmail(email: string) {
    return UserModel.findOne({ email });
  }
  findUserByPhoneNumber(phone_number: string) {
    return UserModel.findOne({ phone_number });
  }
}

export default UserService;
