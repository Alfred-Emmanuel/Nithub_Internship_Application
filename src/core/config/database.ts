import { sequelize } from "./sequelize";
import { syncDatabase } from "../../models/associations";

const initializeDBConnection = async () => {
  try {
    await sequelize.authenticate(); // Test database connection
    console.log("Database Connected");
    await syncDatabase();

    return sequelize; // Return the Sequelize instance
  } catch (error) {
    console.error("Error occurred while connecting to the database:", error);
    throw new Error("Failed to connect to the database");
  }
};

export { initializeDBConnection };
