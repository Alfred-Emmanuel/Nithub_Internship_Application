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
      const { email, password } = req.body;
      if (!email || !password) {
        res.status(400).json({ message: "Email and password are required." });
        return;
      }

      const input = req.body;
      const result = await signIn.handle(input);

      if (result.data?.user) {
        delete result.data.user.password;
      }
      res.status(result.code).json(result);
      return;
    } catch (error: any) {
      if (error instanceof UnAuthorizedError) {
        res.status(401).json({ message: error.message });
      } else {
        console.error("Error stack:", error.stack);
        res.status(500).json({ message: error.message });
        return;
      }
    }
  })
  .post("/sign_up", async (req: Request, res: Response) => {
    try {
      const input = req.body;

      const { email, password, displayName } = req.body;
      if (!email || !password || !displayName) {
        res.status(400).json({ message: "All fields are required." });
        return;
      }
      const result = await signUp.handle(input);

      res.status(result.code).json(result);
    } catch (error: any) {
      if (error instanceof UnAuthorizedError) {
        res.status(401).json({ message: error.message });
      } else {
        res.status(500).json({ message: error.message });
      }
    }
  });

export { authRouter };
