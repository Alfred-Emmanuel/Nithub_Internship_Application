import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../core";

class User extends Model {
  public id!: number;
  public googleId?: string;
  public githubId?: string;
  public displayName!: string;
  public email!: string;
  public password!: string;
  public role!: "user" | "admin"; // New field for role
  public isDeleted!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    googleId: { type: DataTypes.STRING, allowNull: true },
    githubId: { type: DataTypes.STRING, allowNull: true },
    displayName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: {
      type: DataTypes.ENUM("user", "admin"), // Define roles
      defaultValue: "user", // Default role is user
      allowNull: false,
    },
    isDeleted: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    underscored: true,
  }
);

export { User };
