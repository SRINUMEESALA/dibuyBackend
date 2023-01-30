import express, { response } from "express"
import Product from "../models/products.js"

const productsRoute = new express.Router()

// const products = async (request, response) => {
//     console.log("Get products accessed")
//     try {
//         const productsList = await Product.find()
//         response.status(200)
//         response.send({ productsList })
//     } catch (err) {
//         response.status(500)
//         response.send("No products Found")
//     }
// }

const product = async (request, response) => {
    console.log("Get Product is accessed")
    try {
        const _id = request.params.id
        const productsList = await Product.find({ _id })
        response.status(200)
        response.send({ product: productsList[0] })
    } catch (err) {
        response.status(400)
        response.send("No products Found")
    }
}

const products = async (request, response) => {
    console.log("productquery accessed")
    let { category, price, quality, search } = request.query
    const reg = search === '""' ? new RegExp('', "i") : new RegExp(search, "i")
    let order;
    if (price === "HighToLow") {
        order = -1
    } else {
        order = 1
    }
    if (category === "All") {
        try {
            const data = await Product.find({ quality: { $gte: quality }, title: reg }).sort({ price: order })
            response.status(200)
            response.send({ productsList: data })
        } catch (err) {
            response.status(500)
            response.send("No products Found")
        }
    } else {
        try {
            const data = await Product.find({ quality: { $gte: quality }, category, title: reg }).sort({ price: order })
            response.status(200)
            response.send({ productsList: data })
        } catch (err) {
            response.status(500)
            response.send("No products Found")
        }

    }

}





// Routes

productsRoute.get("/products", products)
productsRoute.get("/product/:id", product)


export default productsRoute



// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VyRW1haWwiOiJzcmludXNyaTc2NTg1QGdtYWlsLmNvbSIsImlhdCI6MTY3NDcwODgzMX0.QNkp8Y4jhoKIezwAm8Nc4RYtHYeTX7AbgifIRLfCvpY"