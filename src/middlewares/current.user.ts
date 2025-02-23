import { RequestHandler, Response, NextFunction } from "express";
import { config } from "../core";
import { TokenService } from "../auth";
import { AuthRequest } from "../core"; // Your custom type

export class CurrentUser {
  constructor(private readonly tokenService: TokenService) {}

  isAuthenticated: RequestHandler = (req, res, next) => {
    const authReq = req as AuthRequest;
    const tokenHeader =
      authReq.get("Authorization") || authReq.get("x-Auth-Token");

    if (!tokenHeader) {
      res.status(401).json({ message: "Authorization header is missing" });
      return;
    }

    const token = tokenHeader.split(" ").pop();
    if (!token) {
      res.status(401).json({ message: "No token provided" });
      return;
    }

    try {
      const tokenDetails = this.tokenService.verifyToken(
        token,
        config.auth.accessTokenSecret
      );

      if (!tokenDetails) {
        res.status(401).json({ message: "Invalid token" });
        return;
      }

      authReq.user = { email: tokenDetails.email, id: tokenDetails.id };
      next();
    } catch (err: any) {
      res.status(401).json({ message: "Unauthorized access" });
      return;
    }
  };
}

// Create and export the instance's isAuthenticated method
const tokenService = new TokenService();
const currentUser = new CurrentUser(tokenService);
export const isAuthenticated: RequestHandler = currentUser.isAuthenticated;
