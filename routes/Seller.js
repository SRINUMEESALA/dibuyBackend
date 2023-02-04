import express from "express"
import authorizeUser from "../middlewares/authorizeUser.js"
import Seller from "../models/sellers.js"
import User from "../models/users.js"

const sellerRoute = new express.Router()


const registerSeller = async (request, response) => {
    try {
        let newSeller = request.body
        newSeller = { ...newSeller, sellerEmail: request.currentUser }
        console.log(newSeller)
        const response1 = await Seller(newSeller).save()
        const response2 = await User.updateOne({ email: request.currentUser }, { $set: { isSeller: true } })
        response.status(201)
        response.send({ msg: "seller registered successfully" })
    } catch (err) {
        response.status(500)
        response.send({ msg: "something went wrong" })
        console.log(err)
    }
}


const getSeller = async (request, response) => {
    try {
        const details = await Seller.findOne({ sellerEmail: request.currentUser })
        response.status(200)
        response.send({ seller: details })
    } catch (err) {
        response.status(400)
        response.send({ msg: "something went wrong" })
    }
}

const updateSeller = async (request, response) => {
    try {
        console.log("update seller accessed")
        const details = await Seller.updateOne({ sellerEmail: request.currentUser }, { $set: { ...request.body } })
        response.status(201)
        response.send({ msg: "Update done" })
    } catch (err) {
        response.status(400)
        response.send({ msg: "something went wrong" })
        console.log(err)
    }
}




sellerRoute.post("/seller/register", authorizeUser, registerSeller)
sellerRoute.get("/seller/details", authorizeUser, getSeller)
sellerRoute.post("/seller/update", authorizeUser, updateSeller)

export default sellerRoute