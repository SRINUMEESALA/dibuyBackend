import dotenv from "dotenv"
import express from "express"
import connectToRemoteDb from "./databaseConnections/AtlasDbConnection.js";
import authenticationRoute from "./routes/Authentication.js";
import productsRoute from "./routes/products.js";
import cartRoute from "./routes/cart.js";
import sellerRoute from "./routes/Seller.js";
import bodyParser from 'body-parser';
import userRoute from "./routes/user.js";
import FairPriceRoute from "./routes/FairPrice.js";
import cors from "cors"

const app = express()
dotenv.config()

const port = process.env.PORT || 4000

app.listen(port, () => { console.log(`Server running Successfully at ${port}`) })
connectToRemoteDb()

app.use(express.json())
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(cors())
app.use(authenticationRoute)
app.use(productsRoute)
app.use(cartRoute)
app.use(userRoute)
app.use(sellerRoute)
app.use(FairPriceRoute)






