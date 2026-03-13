import app from "./app.js";
import { connectDB } from "./config/db.js";
import { loadEnv } from "./config/env.js";

loadEnv();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`server is running on port ${PORT}`);
    });
};
startServer();

/** the flow 
 * load env ---> connect to db ---> start server
 */