import { Router, Request, Response } from "express";
import { Order } from "../models";
import { isAuthenticated } from "../../middlewares/current.user";
import { IUser } from "../../core";

const orderRouter = Router();

/**
 * @route   GET /orders
 * @desc    View all orders (Admin only)
 * @access  Admin
 */
// orderRouter.get(
//   "/",
//   isAdminAuthenticated,
//   async (req: Request, res: Response) => {
//     try {
//       const orders = await Order.findAll();
//       res.status(200).json({ code: 200, data: orders });
//     } catch (error: any) {
//       res.status(500).json({ message: error.message });
//     }
//   }
// );

/**
 * @route   GET /orders/:id
 * @desc    View a specific order (Admin or Order Owner)
 * @access  Admin or Owner
 */
orderRouter.get("/:id", isAuthenticated, async (req: IUser, res: Response) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    // Check if user is admin or the order owner
    if (req.user?.role !== "admin" && Number(req.user?.id) !== order.userId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    res.status(200).json({ code: 200, data: order });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /orders/user/:userId
 * @desc    View orders for a specific user (Only their orders)
 * @access  User
 */
orderRouter.get(
  "/user/:userId",
  isAuthenticated,
  async (req: IUser, res: Response) => {
    if (req.user?.id !== req.params.userId) {
      res.status(403).json({ message: "Unauthorized" });
      return;
    }

    try {
      const orders = await Order.findAll({
        where: { userId: req.params.userId },
      });
      res.status(200).json({ code: 200, data: orders });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   POST /orders
 * @desc    Create a new order (User only)
 * @access  User
 */
orderRouter.post("/", isAuthenticated, async (req: IUser, res: Response) => {
  try {
    const { items, totalPrice } = req.body;
    if (!items || !totalPrice) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const order = await Order.create({
      userId: req.user?.id,
      items,
      totalPrice,
    });
    res.status(201).json({ code: 201, message: "Order created", data: order });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   PUT /orders/:id
 * @desc    Update order status
 * @access  Admin or owner
 */
orderRouter.put(
  "/:id",
  isAuthenticated, // Ensure user is logged in
  async (req: IUser, res: Response): Promise<void> => {
    try {
      const order = await Order.findByPk(req.params.id);
      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }

      const { status } = req.body;

      // If the user is an admin, allow all updates
      if (req.user?.role === "admin") {
        await order.update({ status });
        res.status(200).json({
          code: 200,
          message: "Order updated successfully",
          data: order,
        });
        return;
      }

      // If the user is the owner of the order, restrict allowed status updates
      if (Number(req.user?.id) === order.userId) {
        if (status !== "canceled" && status !== "completed") {
          res.status(403).json({
            message:
              "You are only allowed to cancel or mark your order as completed",
          });
          return;
        }

        await order.update({ status });
        res.status(200).json({
          code: 200,
          message: "Order status updated successfully",
          data: order,
        });
        return;
      }

      // If the user is neither the owner nor an admin, deny access
      res.status(403).json({
        message: "Forbidden: You are not authorized to update this order",
      });
      return;
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   DELETE /orders/:id
 * @desc    Cancel order (Admin or Order Owner)
 * @access  Admin or Owner
 */
orderRouter.delete(
  "/:id",
  isAuthenticated,
  async (req: IUser, res: Response) => {
    try {
      const order = await Order.findByPk(req.params.id);
      if (!order) {
        res.status(404).json({ message: "Order not found" });
        return;
      }

      // Allow deletion if user is admin or the order owner
      if (req.user?.role !== "admin" && Number(req.user?.id) !== order.userId) {
        res.status(403).json({ message: "Unauthorized" });
        return;
      }

      await order.destroy();
      res.status(200).json({ code: 200, message: "Order canceled" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

export { orderRouter };
