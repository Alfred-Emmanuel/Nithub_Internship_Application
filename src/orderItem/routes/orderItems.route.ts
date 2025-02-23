import { Router, Request, Response } from "express";
import { OrderItem } from "../models";
import { Order } from "../../orders";
import { isAuthenticated } from "../../middlewares/current.user";
import { IUser } from "../../core";
// import { isAdminAuthenticated } from "../../middlewares/admin.auth";

const orderItemRouter = Router();

/**
 * @route   GET /order-items
 * @desc    View all order items (Admin only)
 * @access  Admin
 */
// orderItemRouter.get(
//   "/",
//   isAdminAuthenticated,
//   async (req: Request, res: Response) => {
//     try {
//       const orderItems = await OrderItem.findAll();
//       res.status(200).json({ code: 200, data: orderItems });
//     } catch (error: any) {
//       res.status(500).json({ message: error.message });
//     }
//   }
// );

/**
 * @route   GET /order-items/:id
 * @desc    View a specific order item (Admin or Order Owner)
 * @access  Admin or Owner
 */
orderItemRouter.get(
  "/:id",
  isAuthenticated,
  async (req: IUser, res: Response) => {
    try {
      const orderItem = await OrderItem.findByPk(req.params.id, {
        include: {
          model: Order,
          as: "order",
        },
      });

      if (!orderItem) {
        res.status(404).json({ message: "Order item not found" });
        return;
      }

      // Get userId from associated order
      const orderUserId = orderItem.order?.userId;

      if (req.user?.role !== "admin" && req.user?.id !== orderUserId) {
        res.status(403).json({ message: "Unauthorized" });
        return;
      }

      res.status(200).json({ code: 200, data: orderItem });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   POST /order-items
 * @desc    Add an item to the user's order
 * @access  User
 */
orderItemRouter.post(
  "/",
  isAuthenticated,
  async (req: IUser, res: Response) => {
    try {
      const { productId, quantity } = req.body;
      if (!productId || !quantity) {
        res.status(400).json({ message: "All fields are required" });
        return;
      }

      const orderItem = await OrderItem.create({
        userId: req.user?.id,
        productId,
        quantity,
      });
      res
        .status(201)
        .json({ code: 201, message: "Order item added", data: orderItem });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   PUT /order-items/:id
 * @desc    Update the user's order item
 * @access  User
 */
orderItemRouter.put(
  "/:id",
  isAuthenticated,
  async (req: IUser, res: Response) => {
    try {
      const orderItem = await OrderItem.findByPk(req.params.id);
      if (!orderItem || orderItem.order?.userId !== req.user?.id) {
        res.status(403).json({ message: "Unauthorized" });
        return;
      }

      await orderItem.update({ quantity: req.body.quantity });
      res
        .status(200)
        .json({ code: 200, message: "Order item updated", data: orderItem });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   DELETE /order-items/:id
 * @desc    Remove an order item (User only)
 * @access  User
 */
orderItemRouter.delete(
  "/:id",
  isAuthenticated,
  async (req: IUser, res: Response) => {
    try {
      const orderItem = await OrderItem.findByPk(req.params.id);
      if (!orderItem || orderItem.order?.userId !== req.user?.id) {
        res.status(403).json({ message: "Unauthorized" });
        return;
      }

      await orderItem.destroy();
      res.status(200).json({ code: 200, message: "Order item removed" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

export { orderItemRouter };
