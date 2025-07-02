// server.js
const express = require("express");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");

const app = express();
const PORT = process.env.PORT || 3000;

// Task 4: Custom Error Classes
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
    this.statusCode = 404;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
    this.statusCode = 400;
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = "AuthenticationError";
    this.statusCode = 401;
  }
}

// Task 4: Async error wrapper function
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// In-memory storage for products
let products = [
  {
    id: uuidv4(),
    name: "Gaming Laptop",
    description: "High-performance gaming laptop with RTX 4070 graphics card",
    price: 1299.99,
    category: "Electronics",
    inStock: true,
  },
  {
    id: uuidv4(),
    name: "Espresso Machine",
    description: "Professional espresso machine with milk frother",
    price: 299.99,
    category: "Kitchen",
    inStock: true,
  },
  {
    id: uuidv4(),
    name: "JavaScript Masterclass",
    description: "Complete guide to modern JavaScript and Node.js development",
    price: 49.99,
    category: "Books",
    inStock: false,
  },
  {
    id: uuidv4(),
    name: "Wireless Headphones",
    description: "Premium noise-cancelling wireless headphones",
    price: 249.99,
    category: "Electronics",
    inStock: true,
  },
  {
    id: uuidv4(),
    name: "Smart Blender",
    description: "High-speed smart blender with app connectivity",
    price: 179.99,
    category: "Kitchen",
    inStock: true,
  },
  {
    id: uuidv4(),
    name: "Web Development Handbook",
    description: "Comprehensive guide to full-stack web development",
    price: 39.99,
    category: "Books",
    inStock: true,
  },
];

// Task 3: Custom Logger Middleware
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
  next();
};

// Task 3: Authentication Middleware
const authenticate = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];
  const validApiKey = process.env.API_KEY || "your-secret-api-key-123";

  if (!apiKey) {
    return next(
      new AuthenticationError(
        "API key is required. Please provide x-api-key header."
      )
    );
  }

  if (apiKey !== validApiKey) {
    return next(new AuthenticationError("Invalid API key provided."));
  }

  next();
};

// Task 3: Validation Middleware for Product Creation/Update
const validateProduct = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  const errors = [];

  // Validate name
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    errors.push("Name is required and must be a non-empty string");
  }

  // Validate description
  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length === 0
  ) {
    errors.push("Description is required and must be a non-empty string");
  }

  // Validate price
  if (
    price === undefined ||
    price === null ||
    typeof price !== "number" ||
    price < 0
  ) {
    errors.push("Price is required and must be a positive number");
  }

  // Validate category
  if (
    !category ||
    typeof category !== "string" ||
    category.trim().length === 0
  ) {
    errors.push("Category is required and must be a non-empty string");
  }

  // Validate inStock (optional field)
  if (inStock !== undefined && typeof inStock !== "boolean") {
    errors.push("inStock must be a boolean value");
  }

  if (errors.length > 0) {
    return next(new ValidationError(errors.join(", ")));
  }

  next();
};

// Task 3: Apply Middleware
app.use(logger);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Task 1: Hello World route at root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "Hello World! Welcome to the Products API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      products: "/api/products",
      search: "/api/products/search",
      stats: "/api/products/stats",
    },
  });
});

// Task 2 & 5: GET /api/products - List all products with filtering and pagination
app.get(
  "/api/products",
  asyncHandler(async (req, res) => {
    try {
      const { category, page = 1, limit = 10 } = req.query;
      let filteredProducts = [...products];

      // Task 5: Filter by category
      if (category) {
        filteredProducts = filteredProducts.filter((p) =>
          p.category.toLowerCase().includes(category.toLowerCase())
        );
      }

      // Task 5: Pagination
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;

      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedProducts,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(filteredProducts.length / limitNum),
          totalItems: filteredProducts.length,
          itemsPerPage: limitNum,
          hasNextPage: endIndex < filteredProducts.length,
          hasPreviousPage: pageNum > 1,
        },
      });
    } catch (error) {
      next(error);
    }
  })
);

// Task 2: GET /api/products/:id - Get specific product by ID
app.get(
  "/api/products/:id",
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const product = products.find((p) => p.id === id);

      if (!product) {
        throw new NotFoundError(`Product with ID ${id} not found`);
      }

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      next(error);
    }
  })
);

// Task 5: GET /api/products/search - Search products by name
app.get(
  "/api/products/search",
  asyncHandler(async (req, res) => {
    try {
      const { q: searchTerm, page = 1, limit = 10 } = req.query;

      if (!searchTerm) {
        throw new ValidationError("Search term (q) is required");
      }

      const searchResults = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Pagination for search results
      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;

      const paginatedResults = searchResults.slice(startIndex, endIndex);

      res.json({
        success: true,
        searchTerm,
        data: paginatedResults,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(searchResults.length / limitNum),
          totalItems: searchResults.length,
          itemsPerPage: limitNum,
        },
      });
    } catch (error) {
      next(error);
    }
  })
);

// Task 5: GET /api/products/stats - Get product statistics
app.get(
  "/api/products/stats",
  asyncHandler(async (req, res) => {
    try {
      const stats = {
        totalProducts: products.length,
        inStockCount: products.filter((p) => p.inStock).length,
        outOfStockCount: products.filter((p) => !p.inStock).length,
        categoryBreakdown: {},
        averagePrice: 0,
        priceRange: {
          min: 0,
          max: 0,
        },
      };

      // Category breakdown
      products.forEach((product) => {
        stats.categoryBreakdown[product.category] =
          (stats.categoryBreakdown[product.category] || 0) + 1;
      });

      // Price statistics
      if (products.length > 0) {
        const prices = products.map((p) => p.price);
        stats.averagePrice =
          Math.round(
            (prices.reduce((sum, price) => sum + price, 0) / prices.length) *
              100
          ) / 100;
        stats.priceRange.min = Math.min(...prices);
        stats.priceRange.max = Math.max(...prices);
      }

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  })
);

// Task 2: POST /api/products - Create new product (with authentication and validation)
app.post(
  "/api/products",
  authenticate,
  validateProduct,
  asyncHandler(async (req, res) => {
    try {
      const { name, description, price, category, inStock = true } = req.body;

      const newProduct = {
        id: uuidv4(),
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: category.trim(),
        inStock,
      };

      products.push(newProduct);

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        data: newProduct,
      });
    } catch (error) {
      next(error);
    }
  })
);

// Task 2: PUT /api/products/:id - Update existing product
app.put(
  "/api/products/:id",
  authenticate,
  validateProduct,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const productIndex = products.findIndex((p) => p.id === id);

      if (productIndex === -1) {
        throw new NotFoundError(`Product with ID ${id} not found`);
      }

      const { name, description, price, category, inStock } = req.body;

      products[productIndex] = {
        ...products[productIndex],
        name: name.trim(),
        description: description.trim(),
        price: parseFloat(price),
        category: category.trim(),
        inStock:
          inStock !== undefined ? inStock : products[productIndex].inStock,
      };

      res.json({
        success: true,
        message: "Product updated successfully",
        data: products[productIndex],
      });
    } catch (error) {
      next(error);
    }
  })
);

// Task 2: DELETE /api/products/:id - Delete product
app.delete(
  "/api/products/:id",
  authenticate,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const productIndex = products.findIndex((p) => p.id === id);

      if (productIndex === -1) {
        throw new NotFoundError(`Product with ID ${id} not found`);
      }

      const deletedProduct = products.splice(productIndex, 1)[0];

      res.json({
        success: true,
        message: "Product deleted successfully",
        data: deletedProduct,
      });
    } catch (error) {
      next(error);
    }
  })
);

// Task 4: Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.name}: ${err.message}`);
  console.error(err.stack);

  // Handle custom errors
  if (
    err instanceof NotFoundError ||
    err instanceof ValidationError ||
    err instanceof AuthenticationError
  ) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.name,
      message: err.message,
      timestamp: new Date().toISOString(),
    });
  }

  // Handle JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      success: false,
      error: "JSON Parse Error",
      message: "Invalid JSON format in request body",
      timestamp: new Date().toISOString(),
    });
  }

  // Handle other unexpected errors
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: "Something went wrong on the server",
    timestamp: new Date().toISOString(),
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Not Found",
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log("\n📋 Available API endpoints:");
  console.log("GET    /                     - Hello World");
  console.log(
    "GET    /api/products         - Get all products (with filtering & pagination)"
  );
  console.log("GET    /api/products/:id     - Get product by ID");
  console.log("GET    /api/products/search  - Search products by name");
  console.log("GET    /api/products/stats   - Get product statistics");
  console.log(
    "POST   /api/products         - Create new product (requires API key)"
  );
  console.log(
    "PUT    /api/products/:id     - Update product (requires API key)"
  );
  console.log(
    "DELETE /api/products/:id     - Delete product (requires API key)"
  );
  console.log("\n🔐 API Key for authenticated routes:");
  console.log("Header: x-api-key: your-secret-api-key-123");
  console.log("\n🧪 Test the API with curl, Postman, or Insomnia");
});
