import mongoose from "mongoose";
import validator from "validator";

const usersSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Email is not valid")
            }
        },
        required: true,
        unique: true
    },
    mobile: {
        type: String,
        validate(value) {
            if (!validator.isMobilePhone(value)) {
                throw new Error("Mobile is not valid")
            }
        },
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    gender: String,
    location: String,
    isSeller: {
        type: Boolean,
        required: true
    },
    cart: Array,
    orders: Array,
    profilePhoto: String,
    products: Array,
    profilePic:String
})


const User = new mongoose.model("User", usersSchema)
export default User