import  ProductRepository  from "../repositories/product.repository.js";
import { ApiError } from "../utils/ApiError.js";

export class ProductService {

  constructor(productRepo = ProductRepository) {
    this.productRepo = productRepo;
  }

  async createProduct(data) {

    if (!data.name || !data.basePrice) {
      throw new ApiError(400, "Product name and price are required");
    }

    return this.productRepo.create(data);
  }

  async getProductById(id) {

    const product = await this.productRepo.findById(id);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    await this.productRepo.incrementViews(id);

    return product;
  }

  async getAllProducts() {
    return this.productRepo.find();
  }

  async searchProducts(query) {

    if (!query) {
      throw new ApiError(400, "Search query required");
    }

    return this.productRepo.search(query);
  }

  async getPopularProducts() {
    return this.productRepo.getPopular();
  }

  async deleteProduct(id) {

    const product = await this.productRepo.findById(id);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return this.productRepo.delete(id);
  }

  async updateProduct(id, data) {
    const product = await this.productRepo.findById(id);

    if (!product) {
      throw new ApiError(404, "Product not found");
    }

    return this.productRepo.update(id, data);
  }

}