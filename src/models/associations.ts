import { sequelize } from "../core";
import { User } from "../users";
import { Order } from "../orders";
import { Product } from "../products";
import { OrderItem } from "../orderItem";

// User associations
User.hasMany(Order, { foreignKey: "userId", as: "orders" });
User.hasMany(Product, { foreignKey: "sellerId", as: "products" });

// Product associations
Product.belongsTo(User, { foreignKey: "sellerId", as: "seller" });
Product.belongsToMany(Order, {
  through: OrderItem,
  foreignKey: "productId",
  as: "orders",
});

// Order associations
Order.belongsTo(User, { foreignKey: "userId", as: "user" });
Order.hasMany(OrderItem, { foreignKey: "orderId", as: "items" });
Order.belongsToMany(Product, {
  through: OrderItem,
  foreignKey: "orderId",
  as: "products",
});

OrderItem.belongsTo(Order, { foreignKey: "orderId", as: "order" });

// Sync models with database
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true }); // or { force: true } for dev
    console.log("Database synced successfully");
  } catch (error) {
    console.error("Error syncing database:", error);
  }
};

export { syncDatabase }
