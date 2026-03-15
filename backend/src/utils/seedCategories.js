import categoryRepository from "../repositories/category.repository.js";
import { DEFAULT_CATEGORIES } from "../constants/defaultCategories.js";

export const seedCategories = async () => {
    const existing = await categoryRepository.find();

    if(existing.length > 0 ) {
        console.log("Category already exist.");
        return;
    }

    for (const category of DEFAULT_CATEGORIES) {
        await categoryRepository.create(category);
    }

    console.log("Default categories created.");
};