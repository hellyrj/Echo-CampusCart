import { ProductService } from "../services/product.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendResponse } from "../utils/apiResponse.js";

 export class ProductController {

    constructor() {
        this.productService = new ProductService();
    }
     
    createProduct = asyncHandler(async (req, res) => {
        const product = await this.productService.createProduct(req.body);
        sendResponse(res, 201, "Product created successfully", product);
    });

    getProducts = asyncHandler(async (req, res) => {
        const products = await this.productService.getAllProducts();
        sendResponse(res, 200, "Products fetched successfully", products);
    });

    getProduct = asyncHandler(async (req, res) => {
        const product = await this.productService.getProductById(req.params.id);
        sendResponse(res, 200, "Product fetched successfully", product);
    });

    searchProducts = asyncHandler(async (req, res) => {
        const { q } = req.query;
        const products = await this.productService.searchProducts(q);
        sendResponse(res, 200, "Search results", products);
    });

    getPopularProducts = asyncHandler(async (req, res) => {
        const products = await this.productService.getPopularProducts();
        sendResponse(res, 200, "Popular products fetched successfully", products);
    });

    updateProduct = asyncHandler(async (req, res) => {
        const product = await this.productService.updateProduct(req.params.id, req.body);
        sendResponse(res, 200, "Product updated successfully", product);
    });

    deleteProduct = asyncHandler(async (req, res) => {
        const result = await this.productService.deleteProduct(req.params.id);
        sendResponse(res, 200, "Product deleted successfully", result);
    });

}
