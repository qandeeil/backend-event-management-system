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
  updateAccount(_id: string, user: IUser) {
    return UserModel.findByIdAndUpdate(_id, user, { new: true });
  }
  getOrganizers() {
    return UserModel.find({
      account_type: "business",
    }).select("_id name profile_image")
  }
}

export default UserService;
