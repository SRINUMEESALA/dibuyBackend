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

const getCorrespondingProducts = async (request, response) => {
    console.log("Accessed - getCorrespondingProducts API")
    const { category } = request.query
    let result = []
    try {
        switch (true) {
            case category !== "":
                const temp = await FairPrice.find({ category })
                result = temp.map(obj => ({ value: obj.name, label: obj.name, fairPrice: obj.fairPrice, dealerPrice: obj.dealerPrice }))
                break;
            default:
                const temporary = await FairPrice.find()
                result = temporary.map(obj => ({ value: obj.name, label: obj.name, fairPrice: obj.fairPrice, dealerPrice: obj.dealerPrice }))
                break;
        }
        response.status(200)
        response.send({ msg: "Fair Products fetched successfully", categoryProductsList: result })
    } catch (err) {
        response.status(500)
        response.send({ msg: "something went wrong" })
        console.log(err)
    }
}

const updateFairPrice = async (request, response) => {
    console.log("Accessed - updateFairPrice API")

    const { mrp, category, dealerPrice, product } = request.body
    try {
        const update = await FairPrice.updateOne({ category: category, name: product }, { $set: { fairPrice: mrp, dealerPrice: dealerPrice } })
        response.status(200)
        response.send({ msg: "Fair Product Price updated successfully" })
    } catch (err) {
        response.status(500)
        response.send({ msg: "something went wrong" })
        console.log(err)
    }
}






FairPriceRoute.get("/fair-price", authorizeUser, getFairPrices)
FairPriceRoute.get("/fair-price/getproducts", authorizeUser, getCorrespondingProducts)
FairPriceRoute.post("/fair-price/update", authorizeUser, updateFairPrice)

export default FairPriceRoute