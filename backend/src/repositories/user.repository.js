import User from "../models/user.model.js";

export class UserRepository {

    async findByEmail(email) {
       return User.findOne({ email });
    }

    async findById(id) {
        return User.findById(id);
    }

    async create(data) {
        return User.create(data);
    }
    
}