import mongoose from "mongoose";

const productsSchema = new mongoose.Schema({
    category: String,
    title: String,
    quantity: String,
    quality: String,
    price: Number,
    imageUrl: String,
    description: String,
    saleType: {
        type: String,
        default: "general"
    }
})

const Product = new mongoose.model("Product", productsSchema)
export default Product
