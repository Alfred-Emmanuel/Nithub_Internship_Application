import fs from "fs";
import path from "path";
import csvParser from "csv-parser";
import { sequelize } from "../../core/config";
import { Product } from "../../products";
import { User } from "../../users"; 

const filePath = path.join(__dirname, "products.csv");

async function migrateProducts() {
  try {
    console.log("Starting Product CSV Migration...");

    const products: any[] = [];
    const invalidProducts: any[] = [];
    const productPromises: Promise<void>[] = []; 

    const stream = fs.createReadStream(filePath).pipe(csvParser());

    for await (const row of stream) {
      const { name, price, description, stock, sellerId } = row;

      if (!name || !price || !description || stock === undefined || !sellerId) {
        console.warn(`Skipping invalid row: ${JSON.stringify(row)}`);
        continue;
      }

      // Push a promise that resolves only when the seller check completes
      productPromises.push(
        (async () => {
          const sellerExists = await User.findOne({ where: { id: sellerId } });

          if (!sellerExists) {
            console.warn(
              `Skipping product: ${name}, seller_id ${sellerId} not found`
            );
            invalidProducts.push({ name, price, description, stock, sellerId });
            return;
          }

          products.push({ name, price, description, stock, sellerId });
        })()
      );
    }

    // Wait for all seller ID checks to complete
    await Promise.all(productPromises);

    console.log("CSV file successfully processed.");

    if (products.length === 0) {
      console.log("No valid products to insert.");
      process.exit(0);
    }

    await sequelize.transaction(async (transaction) => {
      await Product.bulkCreate(products, { transaction });
    });

    console.log("Product migration completed successfully! 🎉");

    if (invalidProducts.length > 0) {
      console.warn("Some products were skipped due to missing sellers:");
      console.table(invalidProducts);
    }

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrateProducts();
