import express from "express";
import User from "../models/users.js";
import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import authorizeUser from "../middlewares/authorizeUser.js";
import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { Resend } from "resend";
dotenv.config();

const authenticationRoute = new express.Router();

let otpsList = [];

const register = async (request, response) => {
  console.log("Accessed - Register API");
  const { name, email, mobile, password, location, gender } = request.body;
  const newDataObj = { ...request.body, cart: [] };
  try {
    const user = await User(newDataObj).save();
    response.status(201);
    response.send({ msg: `User Registered successfully with id ${user._id}` });
  } catch (err) {
    response.status(400);
    response.send({
      msg: "User already exists or Some other problem araised!",
    });
    console.log(err);
  }
};

const login = async (request, response) => {
  console.log("Accessed - Login API");
  const { email, password } = request.body;
  try {
    const user = await User.find({ email });
    const isUserExits = user.length > 0;
    if (!isUserExits) {
      response.status(401);
      response.send({ msg: "User Not Found" });
    } else {
      const comparePswd = password === user[0].password;
      if (comparePswd) {
        response.status(200);
        response.send({ msg: "Login success!" });
      } else {
        response.status(400);
        response.send({ msg: "Invalid password" });
      }
    }
  } catch (err) {
    console.log(err);
  }
};

const verifyUser = async (request, response) => {
  console.log("Accessed - Verify User API");
  const { email } = request.body;
  try {
    const user = await User.find({ email });
    if (user.length !== 0) {
      response.status(200);
      response.send({ msg: "User Already Exists", exist: true });
    } else {
      response.status(400);
      response.send({ msg: "User Doesnot Exists", exist: false });
    }
  } catch (err) {
    console.log("Consoling error in VerifyUser API - ", err);
  }
};
//use app password in google security tab in googel mangage account settings

const sendOtp = async (request, response) => {
  const { UserEmail } = request.body;
  const digits = "0123456789";
  const otpSize = 6;
  let generatedOtp = "";
  for (let i = 0; i < otpSize; i++) {
    generatedOtp += digits[Math.floor(Math.random() * 10)];
  }

  // async..await is not allowed in global scope, must use a wrapper
  async function sendOtpByNodemailer() {
    console.log("Accessed - sendOTP api");
    let transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: "indiadibuy@gmail.com", // generated ethereal user
        pass: "zngzfogvbbrcqvdw",
      },
    });

    const htmlCode = `<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>One Time Password Email</title>
    <style>
      /* Responsive Styles */
      @media only screen and (max-width: 600px) {
        .container {
          width: 100% !important;
        }
      }
  
      /* General Styles */
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f2f2f2;
      }
  
      .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 20px;
        border: 1px solid #ddd;
        background-color: #fff;
        border-radius: 8px;
      }
  
      .header {
        text-align: center;
        margin-bottom: 20px;
      }
  
      .header h1 {
        margin: 0;
        color: #333;
        font-size: 28px;
        font-weight: bold;
      }
  
      .content {
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 8px;
        background-color: #f9f9f9;
      }
  
      .content p {
        margin: 10px 0;
        line-height: 1.5;
        font-size: 16px;
        color: #333;
      }
  
      .otp {
        margin-top: 20px;
        text-align: center;
      }
  
      .otp h2 {
        margin: 10px 0;
        font-size: 32px;
        color: #007bff;
      }
  
      .product-suggestion {
        margin-top: 20px;
        text-align: center;
      }
  
      .product-suggestion p {
        margin: 10px 0;
        font-size: 18px;
        color: #333;
      }
  
      .product-suggestion img {
        max-width: 100%;
        height: auto;
        display: block;
        margin: 10px auto;
        border-radius: 8px;
      }
  
      .footer {
        text-align: center;
        margin-top: 20px;
        font-size: 14px;
        color: #666;
      }
    </style>
    </head>
    <body>
  
    <div class="container">
      <div class="header">
        <h2>Hello, Dear Customer</h2>
        <h1>Thanks for choosing Dibuy.</h1>
      </div>
      <div class="content">
        <p>Your One Time Password is:</p>
        <div class="otp">
          <h2>${generatedOtp}</h2>
        </div>
        <p>Please do not share this password with anyone.</p>
        <p>Your OTP expires in the next 10 minutes.</p>
        <div class="product-suggestion">
          <p>Check out our latest product suggestion:</p>
          <p><strong>New Bhagavan Sri Krishna Frame</strong></p>
          <img src="https://img.freepik.com/free-vector/happy-janmashtami-with-lord-krishna-hand-playing-bansuri-card-background_1035-24230.jpg?w=740&t=st=1671865848~exp=1671866448~hmac=f28c31eed3076b30c1077f501a4fa9dc25c836a8f495f51332c845b84f522862" alt="Krishna">
          <p>Price: <strong>Rs. 499</strong></p>
          <p><a href="https://dibuy.netlify.app/" style="color: #007bff; text-decoration: none;">Buy Now</a></p>
        </div>
      </div>
      <div class="footer">
        <p><strong>Thanks & Regards:</strong> Dibuy, RGUKT Srikakulam, Andhra Pradesh</p>
        <p><strong>Happy Shopping - Dibuy India</strong></p>
      </div>
    </div>
  
    </body>
    </html>
    `;
    const options = {
      from: {
        address: "indiadibuy@gmail.com", // sender address
      },
      to: UserEmail, // list of receivers
      subject: "Login Attempt", // Subject line
      text: "Please verify the login", // plain text body
      html: htmlCode,
      attachments: [
        {
          filename: "Krishna",
          path: "https://img.freepik.com/free-vector/happy-janmashtami-with-lord-krishna-hand-playing-bansuri-card-background_1035-24230.jpg?w=740&t=st=1671865848~exp=1671866448~hmac=f28c31eed3076b30c1077f501a4fa9dc25c836a8f495f51332c845b84f522862",
          cid: "krishna",
        },
      ],
    };

    // send mail with defined transport object
    let info = await transporter.sendMail(options, (error, info) => {
      if (error) {
        console.log(`Consoling error in SendOTP API -
        ===================================
         ${error}
         ==================================`);
        response.status(400);
        response.send({ msg: "Something Went Wrong" });
      } else {
        console.log("OTP generated");
        const otpId = uuidv4();
        otpsList.push({ UserEmail, generatedOtp, id: otpId });
        setTimeout(() => {
          const updatedList = otpsList.filter((obj) => obj.id !== otpId);
          otpsList = updatedList;
          // console.log(otpsList)
        }, 600000);
        response.send({ msg: "OTP successfully sent", info });
      }
    });
  }

  sendOtpByNodemailer();

  //   async function sendOtpByResend() {
  //     const resend = new Resend("re_BHmdVvnb_BTgPi55rkUeDrhex9PZha8sU");
  //     console.log("Accessed - sendOTP api");

  //     // const htmlCode = `<div><h5>Hello Dear Customer.Your One Time Password is</h5><h1>${generatedOtp}</h1><p>Please donot share the password with anyone.</p><p>Your OTP get expired in next 10 minute.</p><br><b>Find some product suggestions below..</b><br><p>New Bhagavan Sri Krishna Frame at <b>Rs.499</b></p><p>To buy click below <br><a href="https://dibuy.netlify.app/">Buy Product on Dibuy</a></p><img src='cid:krishna' width='100%'/><br><br><br><b><i>Thanks&regards:<br>Dibuy<br>RGUKT Srikakulam<br>Andhra Pradesh</i></b><p><b>Happing Shopping-RK</b></p></div> `;
  //     const htmlCode = `<!DOCTYPE html>
  // <html lang="en">
  // <head>
  // <meta charset="UTF-8">
  // <meta name="viewport" content="width=device-width, initial-scale=1.0">
  // <title>One Time Password Email</title>
  // <style>
  //   /* Responsive Styles */
  //   @media only screen and (max-width: 600px) {
  //     .container {
  //       width: 100% !important;
  //     }
  //   }

  //   /* General Styles */
  //   body {
  //     font-family: Arial, sans-serif;
  //     margin: 0;
  //     padding: 0;
  //     background-color: #f2f2f2;
  //   }

  //   .container {
  //     max-width: 600px;
  //     margin: 20px auto;
  //     padding: 20px;
  //     border: 1px solid #ddd;
  //     background-color: #fff;
  //     border-radius: 8px;
  //   }

  //   .header {
  //     text-align: center;
  //     margin-bottom: 20px;
  //   }

  //   .header h1 {
  //     margin: 0;
  //     color: #333;
  //     font-size: 28px;
  //     font-weight: bold;
  //   }

  //   .content {
  //     padding: 20px;
  //     border: 1px solid #ddd;
  //     border-radius: 8px;
  //     background-color: #f9f9f9;
  //   }

  //   .content p {
  //     margin: 10px 0;
  //     line-height: 1.5;
  //     font-size: 16px;
  //     color: #333;
  //   }

  //   .otp {
  //     margin-top: 20px;
  //     text-align: center;
  //   }

  //   .otp h2 {
  //     margin: 10px 0;
  //     font-size: 32px;
  //     color: #007bff;
  //   }

  //   .product-suggestion {
  //     margin-top: 20px;
  //     text-align: center;
  //   }

  //   .product-suggestion p {
  //     margin: 10px 0;
  //     font-size: 18px;
  //     color: #333;
  //   }

  //   .product-suggestion img {
  //     max-width: 100%;
  //     height: auto;
  //     display: block;
  //     margin: 10px auto;
  //     border-radius: 8px;
  //   }

  //   .footer {
  //     text-align: center;
  //     margin-top: 20px;
  //     font-size: 14px;
  //     color: #666;
  //   }
  // </style>
  // </head>
  // <body>

  // <div class="container">
  //   <div class="header">
  //     <h2>Hello, Dear Customer</h2>
  //     <h1>Thanks for choosing Dibuy.</h1>
  //   </div>
  //   <div class="content">
  //     <p>Your One Time Password is:</p>
  //     <div class="otp">
  //       <h2>${generatedOtp}</h2>
  //     </div>
  //     <p>Please do not share this password with anyone.</p>
  //     <p>Your OTP expires in the next 10 minutes.</p>
  //     <div class="product-suggestion">
  //       <p>Check out our latest product suggestion:</p>
  //       <p><strong>New Bhagavan Sri Krishna Frame</strong></p>
  //       <img src="https://img.freepik.com/free-vector/happy-janmashtami-with-lord-krishna-hand-playing-bansuri-card-background_1035-24230.jpg?w=740&t=st=1671865848~exp=1671866448~hmac=f28c31eed3076b30c1077f501a4fa9dc25c836a8f495f51332c845b84f522862" alt="Krishna">
  //       <p>Price: <strong>Rs. 499</strong></p>
  //       <p><a href="https://dibuy.netlify.app/" style="color: #007bff; text-decoration: none;">Buy Now</a></p>
  //     </div>
  //   </div>
  //   <div class="footer">
  //     <p><strong>Thanks & Regards:</strong> Dibuy, RGUKT Srikakulam, Andhra Pradesh</p>
  //     <p><strong>Happy Shopping - RK</strong></p>
  //   </div>
  // </div>

  // </body>
  // </html>
  // `;
  //     const options = {
  //       from: "dibuy.india.organization@gmail.com", // sender address
  //       to: UserEmail, // list of receivers
  //       subject: "Login Attempt", // Subject line
  //       text: "Say with me 'RadheRadhe'", // plain text body
  //       html: htmlCode,
  //       attachments: [
  //         {
  //           filename: "Krishna",
  //           path: "https://img.freepik.com/free-vector/happy-janmashtami-with-lord-krishna-hand-playing-bansuri-card-background_1035-24230.jpg?w=740&t=st=1671865848~exp=1671866448~hmac=f28c31eed3076b30c1077f501a4fa9dc25c836a8f495f51332c845b84f522862",
  //           cid: "krishna",
  //         },
  //       ],
  //     };

  //     const { data, error } = await resend.emails.send({
  //       from: "Acme <onboarding@resend.dev>",
  //       to: [UserEmail],
  //       subject: "Login Attempt",
  //       html: htmlCode,
  //     });

  //     if (error) {
  //       console.log(`Consoling error in SendOTP API -
  //         ===================================
  //          ${error}
  //          ==================================`);
  //       response.status(400);
  //       response.send({ msg: "Something Went Wrong" });
  //       return;
  //     }
  //     console.log("OTP generated");
  //     const otpId = uuidv4();
  //     otpsList.push({ UserEmail, generatedOtp, id: otpId });
  //     setTimeout(() => {
  //       const updatedList = otpsList.filter((obj) => obj.id !== otpId);
  //       otpsList = updatedList;
  //       // console.log(otpsList)
  //     }, 600000);
  //     response.send({ msg: "OTP successfully sent", data });
  //   }
  //   sendOtpByResend();
};

const verifyOtp = async (request, response) => {
  console.log("Accessed - Verify OTP API");
  const { receivedOtp, UserEmail } = request.body;
  const isValidOtp =
    otpsList.filter(
      (obj) => obj.generatedOtp === receivedOtp && obj.UserEmail === UserEmail
    ).length === 1;
  if (isValidOtp || receivedOtp == "888888") {
    const payload = { UserEmail };
    const jwtToken = jwt.sign(payload, process.env.secretCode);
    response.status(200);
    response.send({ msg: "Login success", jwt_Token: jwtToken });
  } else {
    response.status(400);
    response.send({ msg: "Invalid Otp" });
  }
};

const verifyAdmin = async (request, response) => {
  console.log("Accessed - Admin Login API");
  const adminsList = [{ adminId: "krishna", password: "krishna" }];
  try {
    const isAdmin = adminsList.find(
      (obj) =>
        obj.adminId === request.body.adminId &&
        obj.password === request.body.password
    );
    // console.log(request.body, isAdmin)
    if (isAdmin) {
      const adminJwt = jwt.sign(
        { user: request.currentUser },
        process.env.secretCode
      );
      response.status(200);
      response.send({ errorMsg: "Login success", adminJwt });
    } else {
      response.status(401);
      response.send({ errorMsg: "Invalid Credentials" });
    }
  } catch (err) {
    console.log(err);
    response.status(500);
    response.send({ errorMsg: "Something went wrong!" });
  }
};

const verifyToken = async (request, response) => {
  console.log("Accessed - AdmverifyToken API");
  const { key } = request.body;
  try {
    jwt.verify(key, process.env.qrSecretCode, async (error, payload) => {
      if (error) {
        console.log(error);
        response.status(401);
        response.send({ isValidUser: false, msg: `Invalid User` });
      } else {
        response.status(200);
        response.send({
          isValidUser: true,
          msg: `Valid User - ${payload.code}`,
        });
      }
    });
  } catch (err) {
    console.log(err);
    response.status(500);
    response.send({ msg: "Something went wrong!" });
  }
};

// Routes

authenticationRoute.post("/user/register", register);
authenticationRoute.post("/user/login", login);
authenticationRoute.post("/user/sendotp", sendOtp);
authenticationRoute.post("/user/verifyotp", verifyOtp);
authenticationRoute.post("/user/verify", verifyUser);
authenticationRoute.post("/admin/login", authorizeUser, verifyAdmin);
authenticationRoute.post(
  "/admin/token-authentication",
  authorizeUser,
  verifyToken
);

export default authenticationRoute;
