// Example seed data for dropdown options
// You can run this script to populate initial data

import mongoose from "mongoose";
import DropdownOptions from "../models/dropdownOptionsModel.js";
import "dotenv/config";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

const seedData = [
    // Nationalities
    { category: "nationality", value: "INDIA", label: "India", sortOrder: 1 },
    { category: "nationality", value: "USA", label: "United States", sortOrder: 2 },
    { category: "nationality", value: "UK", label: "United Kingdom", sortOrder: 3 },
    { category: "nationality", value: "UAE", label: "United Arab Emirates", sortOrder: 4 },
    { category: "nationality", value: "CANADA", label: "Canada", sortOrder: 5 },
    { category: "nationality", value: "AUSTRALIA", label: "Australia", sortOrder: 6 },
    { category: "nationality", value: "SINGAPORE", label: "Singapore", sortOrder: 7 },
    { category: "nationality", value: "CHINA", label: "China", sortOrder: 8 },
    { category: "nationality", value: "JAPAN", label: "Japan", sortOrder: 9 },
    { category: "nationality", value: "GERMANY", label: "Germany", sortOrder: 10 },

    // Professions
    { category: "profession", value: "ENGINEER", label: "Engineer", sortOrder: 1 },
    { category: "profession", value: "DOCTOR", label: "Doctor", sortOrder: 2 },
    { category: "profession", value: "TEACHER", label: "Teacher", sortOrder: 3 },
    { category: "profession", value: "BUSINESSMAN", label: "Businessman", sortOrder: 4 },
    { category: "profession", value: "LAWYER", label: "Lawyer", sortOrder: 5 },
    { category: "profession", value: "ACCOUNTANT", label: "Accountant", sortOrder: 6 },
    { category: "profession", value: "SOFTWARE_DEVELOPER", label: "Software Developer", sortOrder: 7 },
    { category: "profession", value: "CONSULTANT", label: "Consultant", sortOrder: 8 },
    { category: "profession", value: "MANAGER", label: "Manager", sortOrder: 9 },
    { category: "profession", value: "SELF_EMPLOYED", label: "Self Employed", sortOrder: 10 },
    { category: "profession", value: "RETIRED", label: "Retired", sortOrder: 11 },
    { category: "profession", value: "STUDENT", label: "Student", sortOrder: 12 },

    // PEP Status
    { category: "pepStatus", value: "YES", label: "Yes", sortOrder: 1 },
    { category: "pepStatus", value: "NO", label: "No", sortOrder: 2 },
    { category: "pepStatus", value: "RELATED", label: "Related to PEP", sortOrder: 3 },

    // Birth Countries (can be same as nationalities)
    { category: "birthCountry", value: "INDIA", label: "India", sortOrder: 1 },
    { category: "birthCountry", value: "USA", label: "United States", sortOrder: 2 },
    { category: "birthCountry", value: "UK", label: "United Kingdom", sortOrder: 3 },
    { category: "birthCountry", value: "UAE", label: "United Arab Emirates", sortOrder: 4 },
    { category: "birthCountry", value: "CANADA", label: "Canada", sortOrder: 5 },
    { category: "birthCountry", value: "AUSTRALIA", label: "Australia", sortOrder: 6 },

    // Resident Status
    { category: "residentStatus", value: "CITIZEN", label: "Citizen", sortOrder: 1 },
    { category: "residentStatus", value: "PERMANENT_RESIDENT", label: "Permanent Resident", sortOrder: 2 },
    { category: "residentStatus", value: "TEMPORARY_RESIDENT", label: "Temporary Resident", sortOrder: 3 },
    { category: "residentStatus", value: "WORK_VISA", label: "Work Visa", sortOrder: 4 },
    { category: "residentStatus", value: "STUDENT_VISA", label: "Student Visa", sortOrder: 5 },
    { category: "residentStatus", value: "TOURIST", label: "Tourist", sortOrder: 6 },
];

const seedDropdownOptions = async () => {
    try {
        await connectDB();

        // Clear existing data (optional)
        await DropdownOptions.deleteMany({});
        console.log("Cleared existing dropdown options");

        // Insert seed data
        await DropdownOptions.insertMany(seedData);
        console.log(`✅ Successfully seeded ${seedData.length} dropdown options`);

        process.exit(0);
    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
};

seedDropdownOptions();
