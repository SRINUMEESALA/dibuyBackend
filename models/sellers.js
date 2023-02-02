import mongoose from "mongoose";

const sellersSchema = new mongoose.Schema({
    accountNumber: {
        type: Number,
        required: true
    },
    IFSC: {
        type: String,
        required: true
    },
    accountHolderName: {
        type: String,
        required: true
    },
    sellerEmail: {
        type: String,
        unique: true,
        required: true
    }

})

const Seller = new mongoose.model("Seller", sellersSchema)
export default Seller