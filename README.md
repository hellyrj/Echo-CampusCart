# 🛒 CampusCart - Campus E-commerce Platform

A comprehensive e-commerce platform designed specifically for university campuses, connecting students with local vendors for products and services.

## 📋 Table of Contents

- [🌟 Features](#-features)
- [🏗️ Architecture](#️-architecture)
- [📁 Project Structure](#-project-structure)
- [🚀 Quick Start](#-quick-start)
- [🔧 Development Setup](#-development-setup)
- [📊 Data Flow](#-data-flow)
- [🔐 Authentication & Authorization](#-authentication--authorization)
- [📁 File Upload System](#-file-upload-system)
- [🛠️ API Documentation](#️-api-documentation)
- [🎨 Frontend Components](#-frontend-components)
- [🧪 Testing](#-testing)
- [🤝 Contributing Guidelines](#-contributing-guidelines)
- [📝 Code Standards](#-code-standards)
- [🐛 Debugging Guide](#-debugging-guide)
- [📚 Common Issues](#-common-issues)

---

## 🌟 Features

### For Students
- **Browse Products & Services**: Discover items from local campus vendors
- **Location-Based Search**: Find vendors near your location
- **Smart Filtering**: Filter by category, price, university, and more
- **Wishlist Management**: Save items for later purchase
- **Shopping Cart**: Seamless cart experience
- **Order Tracking**: Real-time order status updates
- **Reviews & Ratings**: Share feedback on products and vendors

### For Vendors
- **Vendor Dashboard**: Complete store management
- **Product Management**: Add, edit, and delete products with images
- **Service Management**: Offer services to the campus community
- **Order Management**: Process and fulfill customer orders
- **Analytics Dashboard**: Track sales and performance
- **Customer Communication**: Manage customer interactions

### For Administrators
- **Admin Dashboard**: System oversight and management
- **Vendor Approval**: Review and approve vendor applications
- **User Management**: Manage platform users
- **System Analytics**: Monitor platform performance
- **Content Moderation**: Ensure quality and compliance

---

## 🏗️ Architecture

### High-Level Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Database      │
│   (React)       │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • React Router  │    │ • Express.js    │    │ • Mongoose      │
│ • Axios         │    │ • JWT Auth      │    │ • GridFS        │
│ • Tailwind CSS  │    │ • Multer        │    │ • Collections   │
│ • Context API   │    │ • Cloudinary    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

**Frontend:**
- **React 18** - Modern UI framework
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls
- **Context API** - State management
- **Lucide React** - Icon library

**Backend:**
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **Multer** - File upload handling
- **Cloudinary** - Image storage
- **GridFS** - File storage for documents

---

## 📁 Project Structure

```
CampusCart/
├── frontend-app/                 # React frontend application
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   │   ├── Navbar.jsx      # Main navigation
│   │   │   ├── ErrorBoundary.jsx # Error handling
│   │   │   └── ...
│   │   ├── context/            # React context providers
│   │   │   ├── AuthContext.jsx # Authentication state
│   │   │   └── WishlistContext.jsx # Wishlist state
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── useAuth.js      # Authentication logic
│   │   │   ├── useProductApi.js # Product API calls
│   │   │   └── ...
│   │   ├── pages/              # Page components
│   │   │   ├── Home.jsx        # Landing page
│   │   │   ├── Products.jsx    # Product listing
│   │   │   ├── VendorDashboard.jsx # Vendor dashboard
│   │   │   └── ...
│   │   ├── api/                # API service files
│   │   │   ├── axios.js        # Axios configuration
│   │   │   ├── product.api.js  # Product API calls
│   │   │   └── ...
│   │   └── App.jsx             # Main app component
│   ├── public/                 # Static assets
│   └── package.json
├── backend/                    # Node.js backend application
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   │   ├── auth.controller.js
│   │   │   ├── product.controller.js
│   │   │   ├── vendor.controller.js
│   │   │   └── ...
│   │   ├── models/             # Mongoose models
│   │   │   ├── user.model.js
│   │   │   ├── product.model.js
│   │   │   ├── vendor.model.js
│   │   │   └── ...
│   │   ├── routes/             # Express routes
│   │   │   ├── auth.routes.js
│   │   │   ├── product.routes.js
│   │   │   └── ...
│   │   ├── services/           # Business logic services
│   │   │   ├── auth.service.js
│   │   │   ├── product.service.js
│   │   │   └── ...
│   │   ├── repositories/       # Data access layer
│   │   │   ├── user.repository.js
│   │   │   ├── product.repository.js
│   │   │   └── ...
│   │   ├── middlewares/        # Express middlewares
│   │   │   ├── auth.middleware.js
│   │   │   ├── upload.js
│   │   │   └── ...
│   │   ├── utils/              # Utility functions
│   │   │   ├── asyncHandler.js
│   │   │   ├── ApiError.js
│   │   │   └── ...
│   │   └── app.js              # Express app setup
│   ├── uploads/                # Local file storage
│   └── package.json
├── docs/                       # Documentation
└── README.md                   # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd CampusCart
```

2. **Install backend dependencies**
```bash
cd backend
npm install
```

3. **Install frontend dependencies**
```bash
cd ../frontend-app
npm install
```

4. **Environment Setup**
   - Create `.env` file in backend root
   - Add environment variables (see `.env.example`)

5. **Start the application**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend-app
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

---

## 🔧 Development Setup

### Environment Variables

Create a `.env` file in the backend directory:



### Database Setup

2. **MongoDB Atlas**
- Create free cluster at https://cloud.mongodb.com
- Get connection string
- Add to `.env` file



## 📊 Data Flow

### User Registration Flow
```
Frontend → Auth API → User Service → User Repository → Database
    ↓
JWT Token ← Auth Service ← User Model ← MongoDB
```

### Product Upload Flow
```
Frontend → Product API → Product Service → Product Repository → Database
    ↓
Images → Cloudinary ← Product Controller ← Multer Middleware
```

### Order Processing Flow
```
Frontend → Order API → Order Service → Order Repository → Database
    ↓
Notification ← Notification Service ← Email Service ← User Model
```

### File Upload Flow
```
Frontend Form → Multer Middleware → GridFS/Cloudinary → Database Reference
    ↓
File URL ← File Service ← Controller ← API Response
```

---

## 🔐 Authentication & Authorization

### JWT-Based Authentication

1. **Login Process**
```javascript
// Frontend sends credentials
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Backend validates and returns JWT
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": "...", "email": "...", "role": "student" }
}
```

2. **Token Storage**
- Stored in localStorage
- Auto-attached to all API requests via axios interceptor

3. **Role-Based Access**
```javascript
// Middleware checks
const authenticate = (req, res, next) => {
  // Verify JWT token
  // Attach user to request
};

const authorize = (roles) => (req, res, next) => {
  // Check if user.role is in allowed roles
};
```

### User Roles
- **Student**: Can browse, purchase, and review
- **Vendor**: Can manage products, services, and orders
- **Admin**: Can manage vendors, users, and system settings

---

## 📁 File Upload System

### Architecture
```
Frontend Form → Multer Middleware → File Processing → Storage Service → Database
```

### Storage Options
1. **Images**: Cloudinary (product images, logos)
2. **Documents**: GridFS (vendor documents, legal files)
3. **Local**: Fallback for development

### Upload Flow Example

**Frontend:**
```javascript
const formData = new FormData();
formData.append('images', file);
formData.append('productData', JSON.stringify(productData));

axios.post('/api/products', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

**Backend Middleware:**
```javascript
// productUpload.js
const uploadProductImages = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    // Validate file type
  }
}).array('images', 10);
```

**Controller Processing:**
```javascript
// Process uploaded files
const processedImages = await processUploadedImages(req.files);
// Save to Cloudinary
// Get URLs and store in database
```

---

## 🛠️ API Documentation

### Base URL
```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

### Authentication Endpoints

#### POST /auth/register
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}
```

#### POST /auth/login
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Product Endpoints

#### GET /products
- Query params: `?category=electronics&minPrice=100&maxPrice=500`
- Returns paginated product list

#### POST /products (Vendor only)
```json
{
  "name": "Laptop",
  "description": "High-performance laptop",
  "basePrice": 999.99,
  "category": "electronics",
  "images": ["url1", "url2"]
}
```

#### PUT /products/:id (Owner only)
- Update product details
- Add/remove images

### Vendor Endpoints

#### POST /vendor/apply
```json
{
  "storeName": "Tech Store",
  "description": "Electronics store",
  "address": "123 Campus St",
  "phone": "+1234567890"
}
```

#### GET /vendor/me
- Get current vendor profile

### Order Endpoints

#### POST /orders/checkout
```json
{
  "items": [
    {
      "productId": "...",
      "quantity": 2,
      "variant": "size:M"
    }
  ],
  "deliveryAddress": "123 Dorm Room"
}
```

#### GET /orders/my-orders
- Get user's order history

### Admin Endpoints

#### GET /admin/stats
- System statistics
- User counts, sales data

#### PATCH /admin/vendors/:id/approve
- Approve vendor application

---

## 🎨 Frontend Components

### Component Hierarchy

```
App.jsx
├── Navbar.jsx
├── Routes/
│   ├── Home.jsx
│   ├── Products.jsx
│   │   ├── ProductCard.jsx
│   │   ├── FilterSidebar.jsx
│   │   └── SearchBar.jsx
│   ├── ProductDetails.jsx
│   │   ├── ImageCarousel.jsx
│   │   ├── AddToCart.jsx
│   │   └── Reviews.jsx
│   ├── VendorDashboard.jsx
│   │   ├── VendorProfile.jsx
│   │   ├── ProductManager.jsx
│   │   └── OrderManager.jsx
│   └── Auth/
│       ├── Login.jsx
│       └── Register.jsx
└── FloatingVendorButton.jsx
```

### State Management

**Context Providers:**
- `AuthContext`: User authentication state
- `WishlistContext`: Wishlist management
- `CartContext`: Shopping cart state

**Custom Hooks:**
- `useAuth()`: Authentication operations
- `useProductApi()`: Product API calls
- `useOrder()`: Order management
- `useWishlist()`: Wishlist operations

### Styling Approach

**Tailwind CSS Configuration:**
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#606C38',
        secondary: '#DDA15E',
        accent: '#283618',
        background: '#FEFAE0'
      }
    }
  }
}
```

**Component Styling:**
- Utility classes for rapid development
- Custom colors for brand consistency
- Responsive design built-in

---


### Frontend Testing
```bash
cd frontend-app
npm run dev
```

### Backend Testing
```bash
cd backend
npm run dev
```



## 🤝 Contributing Guidelines

### Getting Started

1. **Fork the repository**
2. **Create feature branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Make your changes**
4. **Run tests**
```bash
npm test
```

5. **Commit changes**
```bash
git commit -m "feat: add amazing feature"
```

6. **Push to branch**
```bash
git push origin feature/amazing-feature
```

7. **Create Pull Request**

### Commit Message Format

Follow [Conventional Commits](https://conventionalcommits.org/) specification:

```
feat: add new feature
fix: fix bug in existing feature
docs: update documentation
style: code formatting changes
refactor: code refactoring
test: add or update tests
chore: maintenance tasks
```

### Pull Request Process

1. **Update Documentation**
   - Update README if needed
   - Add API documentation for new endpoints

2. **Code Review**
   - Ensure all tests pass
   - Follow code standards
   - Add necessary comments

3. **Merge Requirements**
   - At least one approval
   - All CI checks pass
   - No merge conflicts

---

## 📝 Code Standards

### JavaScript/React Standards

**Component Structure:**
```javascript
// Import statements
import React, { useState, useEffect } from 'react';
import { Component } from './components';

// Component definition
const Component = ({ prop1, prop2 }) => {
  // Hooks
  const [state, setState] = useState();
  
  // Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  // Event handlers
  const handleClick = () => {
    // Handler logic
  };
  
  // Render
  return (
    <div>
      {/* JSX content */}
    </div>
  );
};

export default Component;
```

**Naming Conventions:**
- Components: PascalCase (`UserProfile`)
- Functions: camelCase (`getUserData`)
- Variables: camelCase (`userName`)
- Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
- Files: kebab-case (`user-profile.jsx`)

### Backend Standards

**Controller Structure:**
```javascript
export class Controller {
  constructor(service = new Service()) {
    this.service = service;
  }
  
  methodName = asyncHandler(async (req, res, next) => {
    try {
      // Business logic
      const result = await this.service.method(data);
      sendResponse(res, 200, "Success", result);
    } catch (error) {
      next(error);
    }
  });
}
```

**Service Layer:**
```javascript
export class Service {
  constructor(repository = new Repository()) {
    this.repository = repository;
  }
  
  async method(params) {
    // Validation
    // Business logic
    // Repository calls
    return result;
  }
}
```

### Database Standards

**Model Structure:**
```javascript
const schema = new mongoose.Schema({
  field: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for performance
schema.index({ field: 1 });

// Methods
schema.methods.methodName = function() {
  // Instance method
};

// Statics
schema.statics.staticMethod = function() {
  // Static method
};
```

---

## 🐛 Debugging Guide

### Common Debugging Techniques

**Frontend Debugging:**
```javascript
// Console logging
console.log('Debug:', data);

// React DevTools
// Check component state and props

// Network tab
// Monitor API calls and responses

// Error boundaries
// Catch and display errors gracefully
```

**Backend Debugging:**
```javascript
// Console logging
console.log('=== DEBUG ===');
console.log('Request body:', req.body);
console.log('User ID:', req.user._id);

// Database queries
console.log('Query result:', result);

// Error handling
try {
  // Code that might fail
} catch (error) {
  console.error('Error details:', error);
  throw new ApiError(500, "Specific error message");
}
```

### Common Issues and Solutions

**1. CORS Errors**
```javascript
// backend/src/app.js
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
```

**2. Authentication Issues**
```javascript
// Check token in localStorage
const token = localStorage.getItem('token');
if (!token) {
  // Redirect to login
}

// Verify token format
try {
  const decoded = jwt.verify(token, JWT_SECRET);
} catch (error) {
  // Token is invalid
}
```

**3. File Upload Issues**
```javascript
// Check multer configuration
// Ensure correct field names
// Verify file size limits
// Check file type validation
```

**4. Database Connection Issues**
```javascript
// Check MongoDB URI
// Ensure MongoDB is running
// Verify network connectivity
// Check credentials
```

---

## 📚 Common Issues

### Frontend Issues

**1. Page Not Found (404)**
- Check React Router configuration
- Verify route paths
- Ensure proper component imports

**2. State Not Updating**
- Check React hooks dependencies
- Verify state update functions
- Check for stale closures

**3. Styling Issues**
- Verify Tailwind CSS configuration
- Check class names
- Ensure responsive breakpoints

### Backend Issues

**1. API Not Responding**
- Check server is running
- Verify route configuration
- Check middleware order

**2. Database Errors**
- Check connection string
- Verify model schemas
- Check query syntax

**3. Authentication Failures**
- Verify JWT secret
- Check token format
- Verify middleware configuration

### Performance Issues

**1. Slow Loading**
- Implement lazy loading
- Optimize images
- Add caching strategies

**2. Memory Leaks**
- Clean up event listeners
- Clear intervals/timeouts
- Unsubscribe from observables

---

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)

1. **Build the application**
```bash
npm run build
```

2. **Deploy to platform**
- Connect repository
- Set build command: `npm run build`
- Set output directory: `dist`

### Backend Deployment (Heroku/Railway)

1. **Prepare for deployment**
```bash
# Add production dependencies
npm install --production
```

2. **Environment variables**
- Set all required environment variables
- Update database URI for production

3. **Deploy**
- Connect repository
- Set start command: `npm start`
- Configure port binding

---

## 📞 Support

### Getting Help

1. **Check Documentation**
   - Read this README thoroughly
   - Check API documentation
   - Review code comments

2. **Search Issues**
   - Check existing GitHub issues
   - Look for similar problems

3. **Ask Questions**
   - Create detailed issue report
   - Include error messages
   - Provide reproduction steps

### Issue Reporting Template

```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Node.js version: [e.g. 16.14.0]

## Screenshots
Add screenshots if applicable

## Additional Context
Any other relevant information
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- MongoDB for the flexible database solution
- All contributors who help improve this project

---

**Happy Coding! 🎉**

For any questions or support, please don't hesitate to reach out or create an issue.
