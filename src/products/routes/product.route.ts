import { Router, Request, Response } from "express";
import { Product } from "../models";
import { AuthRequest } from "../../core";
import { isAuthenticated } from "../../middlewares/current.user";

const productRouter = Router();

/**
 * @route   GET /products
 * @desc    Get all products
 * @access  Public
 */
productRouter.get("/", async (req: Request, res: Response) => {
  try {
    const products = await Product.findAll();
    res.status(200).json({ code: 200, data: products });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /products/:id
 * @desc    Get a single product by ID
 * @access  Public
 */
productRouter.get("/:id", async (req: Request, res: Response) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    res.status(200).json({ code: 200, data: product });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   POST /products
 * @desc    Create a new product
 * @access  Authenticated Users
 */
productRouter.post(
  "/",
  isAuthenticated,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // const authReq = req as AuthRequest;
      const { name, price, description, stock } = req.body;

      if (!name || !price || !description || stock === undefined) {
        res.status(400).json({ message: "All fields are required" });
        return;
      }

      if (!req.user) {
        res.status(401).json({ message: "Unauthorized" });
        return;
      }

      const product = await Product.create({
        name,
        price,
        description,
        stock,
        sellerId: req.user.id, // Include sellerId
      });

      res.status(201).json({
        code: 201,
        message: "Product created",
        data: product,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);

/**
 * @route   PUT /products/:id
 * @desc    Update a product
 * @access  Authenticated Users
 */
productRouter.put(
  "/:id",
  isAuthenticated,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { name, price, description, stock } = req.body;
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        res.status(404).json({ message: "Product not found" });
        return;
      }

      // Ensure the authenticated user is the seller
      if (Number(req.user?.id) !== product.sellerId) {
        res
          .status(403)
          .json({
            message: "Unauthorized: You can only edit your own products",
          });
        return;
      }

      await product.update({ name, price, description, stock });

      res
        .status(200)
        .json({ code: 200, message: "Product updated", data: product });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);


/**
 * @route   DELETE /products/:id
 * @desc    Delete a product
 * @access  Authenticated Users
 */
productRouter.delete(
  "/:id",
  isAuthenticated,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const product = await Product.findByPk(req.params.id);

      if (!product) {
        res.status(404).json({ message: "Product not found" });
      }

      // Check if the authenticated user is the seller
      if (!req.user || Number(req.user.id) !== product?.sellerId) {
        res
          .status(403)
          .json({
            message: "Forbidden: You are not authorized to delete this product",
          });
      }

      await product?.destroy();
      res.status(200).json({ code: 200, message: "Product deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
);


export { productRouter };
