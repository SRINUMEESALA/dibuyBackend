import dotenv from "dotenv"
import express from "express"
import connectToRemoteDb from "./databaseConnections/AtlasDbConnection.js";
import authenticationRoute from "./routes/Authentication.js";
import productsRoute from "./routes/products.js";
import cors from "cors"
const app = express()
dotenv.config()

const port = process.env.PORT || 4000

app.listen(port, () => { console.log(`Server running Successfully at ${port}`) })
connectToRemoteDb()

app.use(express.json())
app.use(cors())
app.use(authenticationRoute)
app.use(productsRoute)