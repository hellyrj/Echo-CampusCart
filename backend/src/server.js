import app from "./app.js";
import { connectDB } from "./config/db.js";
import { loadEnv } from "./config/env.js";
import { seedCategories } from "./utils/seedCategories.js";
import { seedUniversities } from "./utils/seedUniversities.js";

loadEnv();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    await seedCategories();
    await seedUniversities();
    app.listen(PORT, () => {
        console.log(`server is running on port ${PORT}`);
    });
};
startServer();

/** 
 * flow 
 * load env ---> connect to db ---> seed categories ---> seed universities ---> start server
 */