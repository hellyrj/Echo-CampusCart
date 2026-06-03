# Database Seed Scripts

This directory contains scripts to seed the database with initial data.

## Available Scripts

### 1. User Seeder (`seedUsers.js`)
Seeds the database with three default users for testing purposes.

## How to Run

### Method 1: Using npm script (Recommended)
```bash
# From the backend directory
npm run seed:users
```

### Method 2: Direct execution
```bash
# From the backend directory
node src/scripts/seedUsers.js
```

## Default Users Created

The user seeder creates three users:

### Student Account
- **Name:** john Student
- **Email:** student@campus.com
- **Password:** student123
- **Role:** student

### Vendor Account
- **Name:** echo Vendor
- **Email:** vendor@campus.com
- **Password:** vendor123
- **Role:** vendor

### Admin Account
- **Name:** Admin User
- **Email:** admin@campus.com
- **Password:** admin123
- **Role:** admin

## Important Notes

1. **Database Connection:** The script uses the `MONGO_URI` from your `.env` file or defaults to `mongodb://localhost:27017/echocart`


3. **Password Hashing:** All passwords are properly hashed using bcrypt before storing in the database.

4. **Environment:** Make sure your `.env` file is properly configured with the correct MongoDB connection string.

## Security Warning

⚠️ **For Development Only:** These default credentials should only be used for development and testing purposes. In a production environment, you should:
- Use strong, unique passwords
- Implement proper user registration flows
- Consider using environment variables for initial admin setup

## Adding More Seeders

To add more seeders:
1. Create a new `.js` file in this directory
2. Follow the same pattern as `seedUsers.js`
3. Add a new script to `package.json` if needed

Example:
```javascript
// seedProducts.js
import Product from '../models/product.model.js';
// ... seeding logic
```

Then add to package.json:
```json
"scripts": {
  "seed:products": "node src/scripts/seedProducts.js"
}
```
