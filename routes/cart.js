import express, { response } from "express"
import User from "../models/users.js"
import { v4 as uuidv4 } from "uuid"
import authorizeUser from "../middlewares/authorizeUser.js"
import Product from "../models/products.js"
import nodemailer from "nodemailer"

const cartRoute = new express.Router()



const addToCart = async (request, response) => {
    console.log("Accessed - AddToCart API")
    const { productId, quantity } = request.body
    try {
        const userResponse = await User.find({ email: request.currentUser })
        let cart = userResponse[0].cart
        if (cart.length === 0) {
            const Ncart = [{ productId, quantity }]
            const user = await User.updateOne({ email: request.currentUser }, { $set: { cart: Ncart } })
            response.status(201)
            response.send({ msg: `cart updated for user ${request.currentUser}` })
        } else {
            const isExist = cart.filter(obj => obj.productId === productId)
            if (isExist.length > 0) {
                const newCart = cart.map(obj => {
                    if (obj.productId === productId) {
                        return { ...obj, quantity: obj.quantity }
                    } else {
                        return obj
                    }
                })
                const user = await User.updateOne({ email: request.currentUser }, { $set: { cart: newCart } })
                response.status(201)
                response.send({ msg: `cart updated for user ${request.currentUser}` })
            } else {
                const newCartList = [...cart, { productId, quantity }]
                const user = await User.updateOne({ email: request.currentUser }, { $set: { cart: newCartList } })
                response.status(201)
                response.send({ msg: `cart updated for user ${request.currentUser}` })
            }
        }

    } catch (err) {
        response.status(400)
        response.send({ msg: "could not update cart" })
        console.log(err)
    }
}


const getCart = async (request, response) => {
    console.log("Accessed - GetCart API")
    try {
        const user = await User.find({ email: request.currentUser })
        const cart = user[0].cart
        const allIds = cart.map(obj => obj.productId)

        const quantities = {}
        cart.map(obj => {
            quantities[obj.productId] = obj.quantity
        })
        const cartProducts = await Product.find({ _id: { $in: allIds } })
        response.status(200);
        response.send({ cart: cartProducts, quantities });

    } catch (err) {
        response.status(404);
        response.send({ msg: "something went wrong in gettting cart details" });
        console.log(err)
    }
}

const RemoveCartItems = async (request, response) => {
    console.log("Accessed - RemoveCartItems API")
    try {
        const { productId } = request.body
        const lst = await User.find({ email: request.currentUser })
        const cart = lst[0].cart
        const newCart = cart.filter(obj => obj.productId !== productId)
        const removeItem = await User.updateOne({ email: request.currentUser }, { $set: { cart: newCart } })

        response.status(200)
        response.send({ msg: "Product removed" })
    } catch (err) {
        response.status(404)
        response.send({ msg: "Product notfound or something went wrong" })
    }

}

const placeOrderAndEmptyCart = async (request, response) => {
    console.log("Accessed - Place order and empty cart API")
    try {
        const user = await User.find({ email: request.currentUser })
        const cart = user[0].cart
        const orders = user[0].orders
        const update = await User.updateOne({ email: request.currentUser }, { $set: { orders: [{ itemsList: cart, orderedTime: new Date(), orderValue: request.body.cartValue, orderId: uuidv4() }, ...orders], cart: [] } })

        // sending mail to user about order confirmation
        async function sendOrderConfirmationByNodemailer() {
            let transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: "dibuy.india.organzation@gmail.com", // generated ethereal user
                    // pass: "ypbxrkdkchrzkxwj", // generated ethereal password
                    pass: "bgvjbwqyqryeivwh", // generated ethereal password
                },
            });

            const htmlCode = `<div><h2>Order confirmation</h2><img src='cid:krishna' width='100%'/><p>Your order is successfully placed.</p><p>Please pay the amount ${request.body.cartValue} rupess when you get your products.</p><h3>Keep Shopping</h3><br><br><br><b><i>Thanks&regards:<br>Dibuy<br>RGUKT Srikakulam<br>Andhra Pradesh</i></b><p><b>Happing Shopping-RadheRadhe</b></p></div> `;

            const options = {
                from: 'srinu.printila@gmail.com', // sender address
                to: request.currentUser, // list of receivers
                subject: "Order Successfully Placed.", // Subject line
                text: "Say with me 'RadheRadhe'", // plain text body
                html: htmlCode,
                attachments: [
                    { filename: "Krishna", path: "https://img.freepik.com/free-vector/customs-clearance-abstract-concept-vector-illustration-customs-duties-import-expert-licensed-customs-broker-freight-declaration-vessel-container-online-tax-payment-abstract-metaphor_335657-1738.jpg?w=740&t=st=1674815024~exp=1674815624~hmac=cc23f814fe6bfe68f97a6654b82f70e2ad8a3473947eb6fc50d50de278480b07", cid: "krishna" }
                ]
            }

            // send mail with defined transport object
            let info = await transporter.sendMail(options, (error, info) => {
                if (error) {
                    console.log(error)
                    response.status(500)
                    response.send({ msg: "Something Went Wrong" })


                } else {
                    console.log("Email generated")
                    const otpId = uuidv4()
                    otpsList.push({ UserEmail, generatedOtp, id: otpId })
                    setTimeout(() => {
                        const updatedList = otpsList.filter(obj => obj.id !== otpId)
                        otpsList = updatedList
                        // console.log(otpsList)
                    }, 600000)
                    response.send({ msg: "Ordered email successfully sent" })
                }
            });
        }


        sendOrderConfirmationByNodemailer();
        response.status(200)
        response.send({ msg: "successfully freed the cart and order placed." })
    } catch (err) {
        response.status(500)
        response.send({ msg: "Could not clear the cart" })
        console.log(err)
    }
}

const getOrdersHistory = async (request, response) => {
    console.log("Accessed - GetOrdersHistory API")
    try {
        const user = await User.find({ email: request.currentUser })
        const orders = user[0].orders
        response.status(200)
        response.send({ orders })

    } catch (err) {
        response.status(404)
        response.send({ msg: "Could not delivery the orders history." })
    }
}

cartRoute.get("/user/cart", authorizeUser, getCart)
cartRoute.post("/user/cart/update", authorizeUser, addToCart)
cartRoute.post("/user/cart/delete", authorizeUser, RemoveCartItems)
cartRoute.post("/user/cart/order", authorizeUser, placeOrderAndEmptyCart)
cartRoute.get("/user/cart/orders/history", authorizeUser, getOrdersHistory)


export default cartRoute