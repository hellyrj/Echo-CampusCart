import { ApiError } from "../utils/ApiError";
import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/user.repository";
import { hashPassword  , comparePassword } from "../utils/hash";
import { generateToken } from "../utils/jwt";

export class AuthService {
     constructor(userRepo) {
       this.userRepo = userRepo;
     }

     async register(name , email , password, university) {

        const existing = await this.userRepo.findByEmail(email);

        if(existing) {
            throw new ApiError(400, "Email already exists");
        }

        const hashPassword = await hashPassword(password);

        const user = await this.userRepo.create ({
            name,
            email,
            password: hashPassword,
            university,
        });
        const token = generateToken(user , id);

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
}