import { Router, Request, Response } from "express";
import { SignIn, SignUp } from "../../auth";
import { RefreshToken, User } from "../models";
import { TokenService } from "../../auth";
// import { Encryptor } from "../../app";
import { UnAuthorizedError } from "../../core";

const authRouter = Router();
// const encryptor = new Encryptor();
const tokenService = new TokenService();

const signIn = new SignIn(User, RefreshToken, tokenService);
const signUp = new SignUp(User);

authRouter
  .post("/login", async (req: Request, res: Response) => {
    try {
      const input = req.body;
      const result = await signIn.handle(input);

      res.status(result.code).json(result);
    } catch (error) {
      if (error instanceof UnAuthorizedError) {
        res.status(401).json({ message: error.message });
      } else {
        res.status(500).json({ message: "An Unexpected Error Occured" });
      }
    }
  })
  .post("sign_up", async (req: Request, res: Response) => {
    try {
      const input = req.body;
      const result = await signUp.handle(input);

      res.status(result.code).json(result);
    } catch (error) {
      if (error instanceof UnAuthorizedError) {
        res.status(401).json({ message: error.message });
      } else {
        res.status(500).json({ message: "An unexpected error occured" });
      }
    }
  });

export { authRouter };
