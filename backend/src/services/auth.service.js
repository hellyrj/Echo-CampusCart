import { ApiError } from "../utils/ApiError.js";
import  UserRepository  from "../repositories/user.repository.js";
import { comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";
import bcrypt from "bcrypt";

export class AuthService {
    //using imported instance as a default 
     constructor(userRepo = UserRepository) {
       this.userRepo = userRepo;
     }

     async register(name , email , password, university) {

        if (!name || !email || !password || !university) {
            throw new ApiError(400, "All fields are required");
        }

        const existing = await this.userRepo.findByEmail(email);

        if(existing) {
            throw new ApiError(400, "Email already exists");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.userRepo.create ({
            name,
            email,
            password: hashedPassword,
            university,
        });
        const token = generateToken(user._id);

        return { user , token};
     }

     async login (email , password) {
        const user = await this.userRepo.findByEmail(email);
        if (!user) throw new ApiError(404 , "Invalid credential");

        const isPasswordValid = await comparePassword(password, user.password);

        if(!isPasswordValid) {
            throw new ApiError(401 , "Invalid credential")
        }

        const token = generateToken(user._id);

        return { user , token };

     };

     async getProfile(user) {
        return user;
     };

     async logout() {
        // For JWT-based auth, logout is typically handled client-side
        // by removing the token from local storage/cookies
        // Server-side logout can be implemented with token blacklisting if needed
        return { message: "Logout successful" };
    };
}