import University from "../models/university.model.js";
import { DEFAULT_UNIVERSITIES } from "../constants/defaultUniversities.js";

export const seedUniversities = async () => {
    try {
        // Clear existing universities
        await University.deleteMany({});
        
        // Insert default universities from constants
        await University.insertMany(DEFAULT_UNIVERSITIES);
        
        console.log(`${DEFAULT_UNIVERSITIES.length} universities seeded successfully`);
    } catch (error) {
        console.error('Error seeding universities:', error);
    }
};