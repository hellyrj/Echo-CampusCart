import University from "../models/university.model.js";
import mongoose from "mongoose";

export const DEFAULT_UNIVERSITIES = [
    {
        name: "University of Lagos",
        location: {
            type: "Point",
            coordinates: [3.3792, 6.9722] // Longitude, Latitude
        },
        address: "University of Lagos, Akoka, Lagos",
        city: "Lagos",
        state: "Lagos State",
        country: "Nigeria"
    },
    {
        name: "University of Ibadan",
        location: {
            type: "Point",
            coordinates: [3.9330, 7.7333] // Longitude, Latitude
        },
        address: "University of Ibadan, Ibadan, Oyo State",
        city: "Ibadan",
        state: "Oyo State",
        country: "Nigeria"
    },
    {
        name: "Obafemi Awolowo University",
        location: {
            type: "Point",
            coordinates: [4.5181, 7.0913] // Longitude, Latitude
        },
        address: "Obafemi Awolowo University, Ile-Ife, Osun State",
        city: "Ile-Ife",
        state: "Osun State",
        country: "Nigeria"
    },
    {
        name: "Ahmadu Bello University",
        location: {
            type: "Point",
            coordinates: [7.5255, 4.7534] // Longitude, Latitude
        },
        address: "Ahmadu Bello University, Zaria, Kaduna State",
        city: "Zaria",
        state: "Kaduna State",
        country: "Nigeria"
    },
    {
        name: "University of Benin",
        location: {
            type: "Point",
            coordinates: [5.6037, 5.2345] // Longitude, Latitude
        },
        address: "University of Benin, Benin City, Edo State",
        city: "Benin City",
        state: "Edo State",
        country: "Nigeria"
    },
    {
        name: "University of Nigeria, Nsukka",
        location: {
            type: "Point",
            coordinates: [7.4555, 8.8966] // Longitude, Latitude
        },
        address: "University of Nigeria, Nsukka, Enugu State",
        city: "Nsukka",
        state: "Enugu State",
        country: "Nigeria"
    },
    {
        name: "University of Ilorin",
        location: {
            type: "Point",
            coordinates: [4.5432, 8.0588] // Longitude, Latitude
        },
        address: "University of Ilorin, Ilorin, Kwara State",
        city: "Ilorin",
        state: "Kwara State",
        country: "Nigeria"
    },
    {
        name: "Federal University of Technology, Minna",
        location: {
            type: "Point",
            coordinates: [6.5417, 9.5795] // Longitude, Latitude
        },
        address: "Federal University of Technology, Minna, Niger State",
        city: "Minna",
        state: "Niger State",
        country: "Nigeria"
    },
    {
        name: "University of Port Harcourt",
        location: {
            type: "Point",
            coordinates: [7.0498, 4.8482] // Longitude, Latitude
        },
        address: "University of Port Harcourt, Port Harcourt, Rivers State",
        city: "Port Harcourt",
        state: "Rivers State",
        country: "Nigeria"
    },
    {
        name: "University of Calabar",
        location: {
            type: "Point",
            coordinates: [8.3224, 4.9753] // Longitude, Latitude
        },
        address: "University of Calabar, Calabar, Cross River State",
        city: "Calabar",
        state: "Cross River State",
        country: "Nigeria"
    }
];

export const seedUniversities = async () => {
    try {
        // Clear existing universities
        await University.deleteMany({});
        
        // Insert default universities
        await University.insertMany(DEFAULT_UNIVERSITIES);
        
        console.log(`${DEFAULT_UNIVERSITIES.length} universities seeded successfully`);
    } catch (error) {
        console.error('Error seeding universities:', error);
    }
};