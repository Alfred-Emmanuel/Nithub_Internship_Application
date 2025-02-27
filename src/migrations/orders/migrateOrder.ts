import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import { sequelize } from "../../core/config";
import { Order } from "../../orders";
import { OrderItem } from "../../orderItem";
import { Product } from "../../products";

const filePath = path.join(__dirname, "orders.csv");

async function migrateOrders() {
  try {
    console.log("Starting CSV Migration...");

    const ordersMap = new Map();
    const orderItems: any[] = [];

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        const { userId, totalAmount, productId, quantity } = row;

        if (!ordersMap.has(userId)) {
          ordersMap.set(userId, { userId, totalAmount, items: [] });
        }

        ordersMap.get(userId).items.push({ productId, quantity });
      })
      .on("end", async () => {
        console.log("CSV file successfully processed. Inserting into DB...");

        await sequelize.transaction(async (transaction) => {
          for (const [_, orderData] of ordersMap) {
            const { userId, totalAmount, items } = orderData;

            // Verify if products exist
            const productIds = items.map((item: any) => item.productId);
            const existingProducts = await Product.findAll({
              where: { id: productIds },
              attributes: ["id"],
              transaction,
            });

            const existingProductIds = new Set(
              existingProducts.map((p) => p.id)
            );
            const invalidProducts = productIds.filter(
              (id: number) => !existingProductIds.has(id)
            );

            if (invalidProducts.length > 0) {
              console.warn(
                `Skipping order for user ${userId}. Invalid product IDs: ${invalidProducts}`
              );
              continue;
            }

            // Create Order
            const order = await Order.create(
              { userId, totalAmount },
              { transaction }
            );

            // Create Order Items
            for (const item of items) {
              orderItems.push({
                orderId: order.id,
                productId: item.productId,
                quantity: item.quantity,
              });
            }
          }

          // Bulk insert order items
          if (orderItems.length > 0) {
            await OrderItem.bulkCreate(orderItems, { transaction });
          }
        });

        console.log("Data migration completed successfully! 🎉");
        process.exit(0);
      });
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// Run Migration
migrateOrders();
