import mongoose from "mongoose";

const productsSchema = new mongoose.Schema({
    categrory: String,
    title: String,
    quantity: String,
    quality: String,
    price: Number,
    imageUrl: String,
    description: String
})

const Product = new mongoose.model("Product", productsSchema)
export default Product
