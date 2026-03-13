import User from "../models/user.model.js";

export class UserRepository {

    async FindByEmail(email) {
       return User.findById(id);
    }

    async FindById(id) {
        return User.findById(id);
    }

    async create(data) {
        return User.create(data);
    }
    
}