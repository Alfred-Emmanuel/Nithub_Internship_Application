import { User } from "../../users";
import { AppMessages } from "../../common";
import {
  UnAuthorizedError,
  HttpStatusCodes,
  PasswordHelper,
  Context,
} from "../../core";
import { SignUpPayload } from "../types/payload";

export class SignUp {
  constructor(public readonly userRepo: typeof User) {}

  handle = async (input: Context<SignUpPayload>) => {
    if (!input) {
      throw new UnAuthorizedError(AppMessages.FAILURE.EMPTY_INPUT);
    }
    const { email, password } = input;

    const existingUser = await this.userRepo.findOne({
      where: {
        email: email,
      },
    });

    if (existingUser) {
      throw new UnAuthorizedError(AppMessages.FAILURE.EMAIL_EXISTS);
    }

    input.password = await PasswordHelper.hashData(password);

    const createdUser = await this.userRepo.create({ ...input });

    return {
      code: HttpStatusCodes.OK,
      message: AppMessages.SUCCESS.SIGNUP,
      data: createdUser,
    };
  };
}
