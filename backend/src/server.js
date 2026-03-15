import app from "./app.js";
import { connectDB } from "./config/db.js";
import { loadEnv } from "./config/env.js";
import { seedCategories } from "./utils/seedCategories.js";

loadEnv();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    await seedCategories();
    app.listen(PORT, () => {
        console.log(`server is running on port ${PORT}`);
    });
};
startServer();

/** the flow 
 * load env ---> connect to db ---> start server
 */