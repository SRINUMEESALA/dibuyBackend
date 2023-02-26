import express from "express";
import authorizeUser from "../middlewares/authorizeUser.js";
import qr from "qrcode";
import User from "../models/users.js";
import jwt from "jsonwebtoken";

const userRoute = new express.Router()


const userDetails = async (request, response) => {
    console.log("Accessed - User Details API")
    try {
        const result = await User.find({ email: request.params.email })
        response.status(200)
        response.send({ user: result[0] })
    } catch (err) {
        console.log(err)
        response.status(404)
        response.send({ msg: "user doesnot exists" })
    }
}


const sendEmail = async (request, response) => {
    response.status(200)
    response.send({ email: request.currentUser })
}

const sendQr = async (request, response) => {
    console.log("Accessed - Send QR API")
    const qrEncodedKey = jwt.sign({ code: request.currentUser }, process.env.qrSecretCode);
    try {
        qr.toDataURL(qrEncodedKey, (err, src) => {
            if (err) {
                response.status(500)
                response.send({ msg: "Couldnot get qr Image" })
            } else {
                response.status(200)
                response.send({ qrImage: src })
            }
        }
        )
    } catch (err) {
        response.status(500)
        response.send({ msg: "Couldnot get qr Image due to server error" })
        console.log(err)
    }

}

const updateUserDetails = async (request, response) => {
    console.log("Accessed - Update User Details API")
    try {
        if (request.body.profilepic === "") {
            const updatedPassword = request.query.newpassword
            const placingInDb = await User.updateOne({ email: request.currentUser }, { $set: { password: updatedPassword } })
            response.status(200)
            response.send({ msg: "password updated" })
        } else {
            const updatedPic = request.body.profilepic
            const placingInDb = await User.updateOne({ email: request.currentUser }, { $set: { profilePic: updatedPic } })
            response.status(200)
            response.send({ msg: "Profile Pic updated" })
        }
    } catch (err) {
        response.status(400)
        response.send({ msg: "could not update password" })
        console.log(err)
    }
}


userRoute.post("/user/update", authorizeUser, updateUserDetails)
userRoute.get("/user/getemail", authorizeUser, sendEmail)
userRoute.get("/users/:email", userDetails)
userRoute.get("/user/qr", authorizeUser, sendQr)


export default userRoute