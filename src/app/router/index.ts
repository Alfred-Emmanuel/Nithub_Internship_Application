import { Router } from "express";
import { authRouter } from "../../users";
import { productRouter } from "../../products";
import { orderRouter } from "../../orders";
import { orderItemRouter } from "../../orderItem";

const appRouter = Router();

appRouter.use("/auth", authRouter);
appRouter.use("/product", productRouter);
appRouter.use("/order", orderRouter);
appRouter.use("/order-item", orderItemRouter);

export { appRouter };
