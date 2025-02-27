import { DataTypes, Model, Association } from "sequelize";
import { sequelize } from "../../core/config/sequelize";
import { Order } from "../../orders";

class OrderItem extends Model {
  public orderId!: number;
  public productId!: number;
  public quantity!: number;

  public order?: Order;

  public static associations: {
    order: Association<OrderItem, Order>;
  };
}

OrderItem.init(
  {
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1 },
    },
  },
  {
    sequelize,
    modelName: "OrderItem",
    tableName: "order_items",
    timestamps: false,
    underscored: true,
  }
);

export { OrderItem };
