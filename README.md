# Express.js Products API

A fully functional RESTful API for managing products, built with Express.js. This API includes authentication, validation, error handling, filtering, pagination, and search functionality.

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- npm or yarn package manager

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repository-url>
   cd express-products-api
   ```

2. **Install dependencies:**
   ```bash
   npm install express body-parser uuid
   # Or install dev dependencies for development
   npm install --save-dev nodemon
   ```

3. **Set up environment variables (optional):**
   ```bash
   cp .env.example .env
   # Edit .env file with your preferred settings
   ```

4. **Start the server:**
   ```bash
   # Development mode (with auto-restart)
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000`

## 📋 API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication
Protected endpoints require an API key in the request headers:
```
x-api-key: your-secret-api-key-123
```

### Product Schema
```json
{
  "id": "uuid-string",
  "name": "string",
  "description": "string", 
  "price": "number",
  "category": "string",
  "inStock": "boolean"
}
```

## 🛠️ API Endpoints

### Public Endpoints

#### 1. Welcome Message
- **GET** `/`
- **Description:** Returns welcome message and API information
- **Authentication:** Not required

**Example Request:**
```bash
curl http://localhost:3000/
```

**Example Response:**
```json
{
  "message": "Hello World! Welcome to the Products API",
  "version": "1.0.0",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "endpoints": {
    "products": "/api/products",
    "search": "/api/products/search",
    "stats": "/api/products/stats"
  }
}
```

#### 2. Get All Products
- **GET** `/api/products`
- **Description:** Retrieve all products with optional filtering and pagination
- **Authentication:** Not required
- **Query Parameters:**
  - `category` (optional): Filter by category
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)

**Example Requests:**
```bash
# Get all products
curl http://localhost:3000/api/products

# Filter by category
curl "http://localhost:3000/api/products?category=Electronics"

# With pagination
curl "http://localhost:3000/api/products?page=2&limit=5"

# Combined filters
curl "http://localhost:3000/api/products?category=Electronics&page=1&limit=3"
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "Gaming Laptop",
      "description": "High-performance gaming laptop",
      "price": 1299.99,
      "category": "Electronics",
      "inStock": true
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 2,
    "totalItems": 12,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

#### 3. Get Product by ID
- **GET** `/api/products/:id`
- **Description:** Retrieve a specific product by its ID
- **Authentication:** Not required

**Example Request:**
```bash
curl http://localhost:3000/api/products/uuid-1
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-1",
    "name": "Gaming Laptop",
    "description": "High-performance gaming laptop",
    "price": 1299.99,
    "category": "Electronics",
    "inStock": true
  }
}
```

#### 4. Search Products
- **GET** `/api/products/search`
- **Description:** Search products by name or description
- **Authentication:** Not required
- **Query Parameters:**
  - `q` (required): Search term
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10)

**Example Request:**
```bash
curl "http://localhost:3000/api/products/search?q=laptop&page=1&limit=5"
```

**Example Response:**
```json
{
  "success": true,
  "searchTerm": "laptop",
  "data": [
    {
      "id": "uuid-1",
      "name": "Gaming Laptop",
      "description": "High-performance gaming laptop",
      "price": 1299.99,
      "category": "Electronics",
      "inStock": true
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalItems": 1,
    "itemsPerPage": 5
  }
}
```

#### 5. Get Product Statistics
- **GET** `/api/products/stats`
- **Description:** Get comprehensive product statistics
- **Authentication:** Not required

**Example Request:**
```bash
curl http://localhost:3000/api/products/stats
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 6,
    "inStockCount": 5,
    "outOfStockCount": 1,
    "categoryBreakdown": {
      "Electronics": 2,
      "Kitchen": 2,
      "Books": 2
    },
    "averagePrice": 203.32,
    "priceRange": {
      "min": 39.99,
      "max": 1299.99
    }
  }
}
```

### Protected Endpoints (Require API Key)

#### 6. Create Product
- **POST** `/api/products`
- **Description:** Create a new product
- **Authentication:** Required
- **Headers:** `x-api-key: your-secret-api-key-123`

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-123" \
  -d '{
    "name": "Smartphone",
    "description": "Latest model smartphone with advanced features",
    "price": 799.99,
    "category": "Electronics",
    "inStock": true
  }'
```

**Example Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "new-uuid",
    "name": "Smartphone",
    "description": "Latest model smartphone with advanced features",
    "price": 799.99,
    "category": "Electronics",
    "inStock": true
  }
}
```

#### 7. Update Product
- **PUT** `/api/products/:id`
- **Description:** Update an existing product
- **Authentication:** Required
- **Headers:** `x-api-key: your-secret-api-key-123`

**Example Request:**
```bash
curl -X PUT http://localhost:3000/api/products/uuid-1 \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-123" \
  -d '{
    "name": "Updated Gaming Laptop",
    "description": "High-performance gaming laptop with RTX 4080",
    "price": 1599.99,
    "category": "Electronics",
    "inStock": true
  }'
```

**Example Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "id": "uuid-1",
    "name": "Updated Gaming Laptop",
    "description": "High-performance gaming laptop with RTX 4080",
    "price": 1599.99,
    "category": "Electronics",
    "inStock": true
  }
}
```

#### 8. Delete Product
- **DELETE** `/api/products/:id`
- **Description:** Delete a product
- **Authentication:** Required
- **Headers:** `x-api-key: your-secret-api-key-123`

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/api/products/uuid-1 \
  -H "x-api-key: your-secret-api-key-123"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": {
    "id": "uuid-1",
    "name": "Gaming Laptop",
    "description": "High-performance gaming laptop",
    "price": 1299.99,
    "category": "Electronics",
    "inStock": true
  }
}
```

## 🔧 Error Handling

The API returns consistent error responses with appropriate HTTP status codes:

### Error Response Format
```json
{
  "success": false,
  "error": "ErrorType",
  "message": "Detailed error message",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Common Error Types

#### 400 - Bad Request (ValidationError)
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-123" \
  -d '{"name": ""}'
```

**Response:**
```json
{
  "success": false,
  "error": "ValidationError",
  "message": "Name is required and must be a non-empty string, Description is required and must be a non-empty string, Price is required and must be a positive number, Category is required and must be a non-empty string",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 401 - Unauthorized (AuthenticationError)
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Test Product"}'
```

**Response:**
```json
{
  "success": false,
  "error": "AuthenticationError",
  "message": "API key is required. Please provide x-api-key header.",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

#### 404 - Not Found (NotFoundError)
```bash
curl http://localhost:3000/api/products/non-existent-id
```

**Response:**
```json
{
  "success": false,
  "error": "NotFoundError",
  "message": "Product with ID non-existent-id not found",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🧪 Testing

### Using cURL
All the examples above use cURL commands that you can run directly in your terminal.

### Using Postman
1. Import the endpoints into Postman
2. Set up environment variables:
   - `base_url`: `http://localhost:3000`
   - `api_key`: `your-secret-api-key-123`
3. Add the `x-api-key` header to protected endpoints

### Using Insomnia
1. Create a new workspace
2. Add the base URL: `http://localhost:3000`
3. Create requests for each endpoint
4. Add authentication header for protected routes

## 🏗️ Project Structure

```
express-products-api/
├── server.js           # Main application file
├── package.json        # Dependencies and scripts
├── .env.example        # Environment variables template
├── README.md          # This file
└── .gitignore         # Git ignore rules
```

## 🔐 Environment Variables

Create a `.env` file based on `.env.example`:

```env
PORT=3000
API_KEY=your-secret-api-key-123
```

## 🚀 Features Implemented

### ✅ Task 1: Express.js Setup
- [x] Node.js project initialization
- [x] Express.js installation and setup
- [x] Server listening on port 3000
- [x] "Hello World" route at root endpoint

### ✅ Task 2: RESTful API Routes
- [x] Product resource with all required fields (id, name, description, price, category, inStock)
- [x] GET /api/products - List all products
- [x] GET /api/products/:id - Get specific product
- [x] POST /api/products - Create new product
- [x] PUT /api/products/:id - Update product
- [x] DELETE /api/products/:id - Delete product

### ✅ Task 3: Middleware Implementation
- [x] Custom logger middleware (logs method, URL, timestamp, IP)
- [x] JSON body parser middleware
- [x] Authentication middleware (API key validation)
- [x] Validation middleware for product operations

### ✅ Task 4: Error Handling
- [x] Global error handling middleware
- [x] Custom error classes (NotFoundError, ValidationError, AuthenticationError)
- [x] Proper HTTP status codes
- [x] Async error handling with wrapper function

### ✅ Task 5: Advanced Features
- [x] Query parameters for filtering by category
- [x] Pagination support with metadata
- [x] Search endpoint for products by name/description
- [x] Statistics endpoint with comprehensive analytics

## 📝 Additional Notes

- Uses UUID for unique product identifiers
- In-memory storage (can be easily replaced with database)
- Comprehensive input validation
- Consistent API response format
- Professional error handling
- Request logging for debugging
- Sample data included for testing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable