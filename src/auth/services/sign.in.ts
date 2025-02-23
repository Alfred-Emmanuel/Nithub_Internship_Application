import { AppMessages } from "../../common";
import {
  Context,
  UnAuthorizedError,
  HttpStatusCodes,
  PasswordHelper,
} from "../../core";
import { User } from "../../users";
import { RefreshToken } from "../../users";
import { TokenService } from "../helpers";
import { SignInPayload } from "../types/payload";

export class SignIn {
  constructor(
    private readonly users: typeof User,
    private readonly refreshTokenTable: typeof RefreshToken,
    private readonly tokenService: TokenService
  ) {}

  /**
   * @description authenticates user and generates tokens for them
   * @throws {UnAuthorizedError} error
   * @param { Context<SignInPayload> } param
   * @returns
   */
  handle = async (input: Context<SignInPayload>) => {
    const user = await this.users.findOne({ where: { email: input.email } });

    if (!user) {
      throw new UnAuthorizedError(AppMessages.FAILURE.INVALID_CREDENTIALS);
    }

    const correctPassword = await PasswordHelper.compareHashData(
      input.password,
      user.password
    );
    if (!correctPassword) {
      throw new UnAuthorizedError(AppMessages.FAILURE.INVALID_CREDENTIALS);
    }

    const [accessToken, refresh_token] = await this.tokenService.getTokens({
      id: user.id.toString(),
      email: user.email,
    });

    this.refreshTokenTable.create({
      userId: user.id,
      token: refresh_token,
    });

    return {
      code: HttpStatusCodes.OK,
      message: AppMessages.SUCCESS.LOGIN,
      data: {
        user: user.toJSON(),
        tokens: {
          access_token: accessToken,
          refresh_token: refresh_token,
        },
      },
    };
  };
}
