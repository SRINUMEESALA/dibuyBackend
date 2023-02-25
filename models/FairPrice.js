import mongoose from "mongoose";

const fairPricesSchema = new mongoose.Schema({
    name: String,
    category: String,
    fairPrice: Number,
    dealerPrice: Number,
    image: String
})

const FairPrice = new mongoose.model("FairPrice", fairPricesSchema)
export default FairPrice
