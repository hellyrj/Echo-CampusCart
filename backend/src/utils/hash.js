import bcrypt from "bcrypt";

// Fix: Rename second parameter to avoid confusion
export const comparePassword = async (password, hashedPassword) => {  
    if (!password || !hashedPassword) {
        throw new Error("Both password and hash are required");
    }
    return bcrypt.compare(password, hashedPassword);
};