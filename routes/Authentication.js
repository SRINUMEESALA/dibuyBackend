import express from "express"
import User from "../models/users.js"
import nodemailer from "nodemailer"
import { v4 as uuidv4 } from "uuid"
import jwt from "jsonwebtoken"
const authenticationRoute = new express.Router()

let otpsList = []

const register = async (request, response) => {
    const { name, email, mobile, password, location, gender } = request.body;
    try {
        const user = await User(request.body).save()
        response.status(200);
        response.send({ msg: `User Registered successfully with id ${user._id}` });
    } catch (err) {
        response.status(400);
        response.send({ msg: "User already exists or Some other problem araised!" });
        console.log(err)
    }
}

const login = async (request, response) => {
    console.log("/login route is accessed")
    const { email, password } = request.body;
    const user = await User.find({ email })
    const isUserExits = user.length > 0
    if (!isUserExits) {
        response.status(400);
        response.send({ msg: "User Not Found" });
    } else {
        const comparePswd = password === user[0].password
        if (comparePswd) {
            response.status(200);
            response.send({ msg: "Login success!" });
        } else {
            response.status(400);
            response.send({ msg: "Invalid password" });
        }
    }
}

const verifyUser = async (request, response) => {
    console.log("Verify User triggered")
    const { email } = request.body
    const user = await User.find({ email })
    if (user.length !== 0) {
        response.status(200)
        response.send({ msg: "User Already Exists", exist: true })
    } else {
        response.status(400)
        response.send({ msg: "User Doesnot Exists", exist: false })
    }
}
//use app password in google security tab in googel mangage account settings

const sendOtp = async (request, response) => {
    const { UserEmail } = request.body
    const digits = "0123456789"
    const otpSize = 6
    let generatedOtp = ""
    for (let i = 0; i < otpSize; i++) {
        generatedOtp += digits[Math.floor(Math.random() * 10)]
    }

    // async..await is not allowed in global scope, must use a wrapper
    async function sendOtpByNodemailer() {
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: "dibuyindia@gmail.com", // generated ethereal user
                // pass: "ypbxrkdkchrzkxwj", // generated ethereal password
                pass: "wljeddklerpagoyz", // generated ethereal password
            },
        });

        const htmlCode = `<div><h5>Hello Dear Customer.Your One Time Password is</h5><h1>${generatedOtp}</h1><p>Please donot share the password with anyone.</p><p>Your OTP get expired in next 10 minute.</p><br><br><br><b><i>Thanks&regards:<br>Dibuy<br>RGUKT Srikakulam<br>Andhra Pradesh</i></b><p><b>Happing Shopping-RadheRadhe</b></p><img src='cid:krishna' width='100%'/></div> `;

        const options = {
            from: 'dibuyindia@gmail.com', // sender address
            to: UserEmail, // list of receivers
            subject: "Login Attempt", // Subject line
            text: "Say with me 'RadheRadhe'", // plain text body
            html: htmlCode,
            attachments: [
                { filename: "Krishna", path: "https://img.freepik.com/free-vector/happy-janmashtami-with-lord-krishna-hand-playing-bansuri-card-background_1035-24230.jpg?w=740&t=st=1671865848~exp=1671866448~hmac=f28c31eed3076b30c1077f501a4fa9dc25c836a8f495f51332c845b84f522862", cid: "krishna" }
            ]
        }

        // send mail with defined transport object
        let info = await transporter.sendMail(options, (error, info) => {
            if (error) {
                console.log(error)
                response.status(400)
                response.send({ msg: "Something Went Wrong" })


            } else {
                console.log("OTP generated")
                const otpId = uuidv4()
                otpsList.push({ UserEmail, generatedOtp, id: otpId })
                setTimeout(() => {
                    const updatedList = otpsList.filter(obj => obj.id !== otpId)
                    otpsList = updatedList
                    console.log(otpsList)
                }, 600000)
                response.send({ msg: "OTP successfully sent" })
            }
        });
    }


    sendOtpByNodemailer();

}

const verifyOtp = async (request, response) => {
    const { receivedOtp, UserEmail } = request.body
    console.log(request.body, otpsList)
    const isValidOtp = (otpsList.filter(obj => obj.generatedOtp === receivedOtp && obj.UserEmail === UserEmail)).length === 1
    if (isValidOtp) {
        const payload = { UserEmail };
        const jwtToken = jwt.sign(payload, "secret_token");
        response.status(200)
        response.send({ msg: "Login success", jwt_Token: jwtToken })

    } else {
        response.status(400)
        response.send({ msg: "Invalid Otp" })

    }
}




// Routes

authenticationRoute.post("/user/register", register)
authenticationRoute.post("/user/login", login);
authenticationRoute.post("/user/sendotp", sendOtp)
authenticationRoute.post("/user/verifyotp", verifyOtp)
authenticationRoute.post("/user/verify", verifyUser)


export default authenticationRoute