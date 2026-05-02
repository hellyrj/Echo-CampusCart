// config/env.js
import dotenv from "dotenv";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const loadEnv = () => {
    // Try multiple paths
    const envPaths = [
        path.resolve(process.cwd(), '.env'),           // Current working directory
        path.resolve(__dirname, '../../.env'),         // Project root (2 levels up)
        path.resolve(__dirname, '../.env'),            // One level up
        '.env'                                         // Default
    ];
    
    let loaded = false;
    
    for (const envPath of envPaths) {
        console.log(`Trying to load .env from: ${envPath}`);
        const result = dotenv.config({ path: envPath });
        
        if (!result.error) {
            console.log(`✅ Loaded .env from: ${envPath}`);
            loaded = true;
            break;
        }
    }
    
    if (!loaded) {
        console.error('❌ Failed to load .env from any path');
        return false;
    }
    
    console.log('=== Environment Variables Status ===');
    console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME || '❌ Missing');
    console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? '✓ Present' : '❌ Missing');
    console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✓ Present' : '❌ Missing');
    console.log('====================================');
    
    return true;
};

// Auto-load when this file is imported
loadEnv();