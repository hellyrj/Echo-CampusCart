import User from "../models/user.model.js";
import BaseRepository from "./base.repository.js";

class UserRepository extends BaseRepository {

    constructor() {
        super(User);
    }

    async findByEmail(email) {
       return this.findOne({ email });
    }
    
}

export default new UserRepository();