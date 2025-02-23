import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../core";

class Order extends Model {
  public id!: number;
  public userId!: number;
  public totalAmount!: number;
  public status!: "pending" | "completed" | "cancelled";
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Order.init(
  {
    userId: { type: DataTypes.INTEGER, allowNull: false },
    totalAmount: { type: DataTypes.FLOAT, allowNull: false },
    status: {
      type: DataTypes.ENUM("pending", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    modelName: "Order",
    tableName: "orders",
    timestamps: true,
    underscored: true,
  }
);

export { Order };
