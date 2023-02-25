import express from "express"
import authorizeUser from "../middlewares/authorizeUser.js"
import FairPrice from "../models/FairPrice.js"

const FairPriceRoute = new express.Router()


const getFairPrices = async (request, response) => {
    console.log("Accessed - Get Fair Prices API")
    const { search, category } = request.query
    const rEx = new RegExp(search, "i")
    let result
    try {
        switch (true) {
            case search !== "" && category !== "":
                result = await FairPrice.find({ name: rEx, category })
                break;
            case category !== "":
                result = await FairPrice.find({ category })
                break;
            case search !== "":
                result = await FairPrice.find({ name: rEx })
                break;
            default:
                result = await FairPrice.find()
                break;
        }
        response.status(200)
        response.send({ msg: "Fair Prices fetched successfully", fairPriceList: result })
    } catch (err) {
        response.status(500)
        response.send({ msg: "something went wrong" })
        console.log(err)
    }
}






FairPriceRoute.get("/fair-price", authorizeUser, getFairPrices)

export default FairPriceRoute