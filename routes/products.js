import express, { request, response } from "express"
import Product from "../models/products.js"
import User from "../models/users.js"
import authorizeUser from "../middlewares/authorizeUser.js"

const productsRoute = new express.Router()


const product = async (request, response) => {
    console.log("Accessed - Product API")
    try {
        const _id = request.params.id
        const productsList = await Product.find({ _id })
        const similarProducts = await Product.find({ category: productsList[0].category }).limit(8)
        // console.log()
        response.status(200)
        response.send({ product: productsList[0], similarProducts })
    } catch (err) {
        response.status(404)
        response.send("No products Found")
        console.log(err)
    }
}

const products = async (request, response) => {
    console.log("Accessed - Products API")
    let { category, price, quality, search, saleType } = request.query
    const reg = search === '""' ? new RegExp('', "i") : new RegExp(search, "i")
    let order;
    if (price === "HighToLow") {
        order = -1
    } else {
        order = 1
    }
    if (category === "All") {
        try {
            const data = await Product.find({ quality: { $gte: quality }, title: reg, saleType }).sort({ price: order })
            response.status(200)
            response.send({ productsList: data })
        } catch (err) {
            response.status(500)
            response.send("No products Found")
            console.log(err)
        }
    } else {
        try {
            const data = await Product.find({ quality: { $gte: quality }, category, title: reg, saleType }).sort({ price: order })
            response.status(200)
            response.send({ productsList: data })
        } catch (err) {
            response.status(500)
            response.send("No products Found")
            console.log(err)
        }

    }

}

const addProduct = async (request, response) => {
    console.log("Accessed - AddProduct API")
    try {
        console.log(request.body)
        const prod = await Product(request.body).save()
        const prodId = prod._id.valueOf()
        // console.log(prodId)
        const findingUser = await User.findOne({ email: request.currentUser })
        // console.log(findingUser.products)
        const newProductsList = [...findingUser.products, prodId]
        // console.log(newProductsList)
        const addToUser = await User.updateOne({ email: request.currentUser }, { $set: { products: newProductsList } })
        response.status(201)
        response.send({ msg: "Product successfully added." })
    } catch (err) {
        console.log(err)
        response.status(500)
        response.send({ msg: "could add product" })
    }
}

const getSellerProducts = async (request, response) => {
    console.log("Accessed - GetSellerProducts API")
    try {
        const getUser = await User.findOne({ email: request.currentUser })
        const productsList = getUser.products
        const allProducts = await Product.find({ _id: { $in: productsList } })
        response.status(200)
        response.send({ products: allProducts })
    } catch (err) {
        console.log(err)
        response.status(400)
        response.send({ msg: "Couldnot get products." })
    }
}


const findCategories = async (request, response) => {
    console.log("Accessed - FindCategories API")
    try {
        const res = await Product.aggregate([
            { $group: { _id: "$category" } }
        ])
        let finalCat = []
        res.forEach(e => {
            if (e._id !== null) {
                finalCat.push({ label: e._id, id: e._id })
            }
        })
        response.status(200)
        response.send(finalCat)
    } catch (err) {
        response.status(500)
        response.send({ msg: "Can't get products categories" })
        console.log(err)
    }


}


const getProductsForGovt = async (request, response) => {
    try {
        const products = await Product.find({ saleType: "government" })
        response.status(200)
        response.send({ productsLst: products })
    } catch (err) {
        console.log(err)
        response.status(500)
        response.send({ msg: "Could not get products for Govt" })
    }
}




// Routes

productsRoute.get("/products", products)
productsRoute.get("/product/:id", product)
productsRoute.post("/products/add", authorizeUser, addProduct)
productsRoute.get("/seller/products", authorizeUser, getSellerProducts)
productsRoute.get("/products/categories", authorizeUser, findCategories)
productsRoute.get("/products/products-for-govt", authorizeUser, getProductsForGovt)


export default productsRoute




// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VyRW1haWwiOiJzcmludXNyaTc2NTg1QGdtYWlsLmNvbSIsImlhdCI6MTY3NDcwODgzMX0.QNkp8Y4jhoKIezwAm8Nc4RYtHYeTX7AbgifIRLfCvpY"



// const a = async () => {
//     // const del = await Product.deleteMany()
//     const update = await Product.updateMany({ saleType: "general" })
// }
// a()