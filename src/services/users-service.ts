import { IJWTPayload, ILogin, IUserInput } from "../@types/@types";
import User from "../db/models/user-model";
import BizCardsError from "../errors/BizCardsError";
import { authService } from "./auth-service";

export const usersService = {
 //update user
  updateUser: async (id: string, data: IUserInput) => {
    data.password = await authService.hashPassword(data.password);
    const user = await User.findByIdAndUpdate(id, data, { new: true });
    return user;

  },

  //create user
  createUser: async (data: IUserInput) => {
    const user = new User(data);
    //replace the password with it's hash
    const hash = await authService.hashPassword(user.password);
    user.password = hash;
    return user.save();
  },

  //login
  loginUser: async ({ email, password }: ILogin) => {
    const user = await User.findOne({ email });

    if (!user) {
      throw new BizCardsError(401, "Invalid email or password");
    }

    //check the pass:
    const isValid = await authService.comparePassword(password, user.password);

    if (!isValid) {
      throw new BizCardsError(401, "Invalid email or password");
    }
    // payload {isAdmin ,isBusiness, _id}
    const payload: IJWTPayload = {
      _id: user._id.toString(),
      isAdmin: user.isAdmin,
      isBusiness: user.isBusiness,
    };
    return authService.generateJWT(payload);
  },
  //get all users
  getAllUsers: async () => User.find({}, { password: 0 }),

  getUserById: async (id: string) => User.findById(id, { password: 0 }),

  deleteUser: async (id: string) => {
    const user = await User.findByIdAndDelete(id);
    if (!user)
      throw new BizCardsError(404, "User not found");
    return user;
  },
};
