import bcrpt from "bcrypt";

export const hashPassword = async (password) => {
    return bcrypt.hash(password, 10);
};

export const comparePassword = async (paswword , hashPassword) => {
    return bcrypt.compare(password, hashPassword);
}