import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

const connectToRemoteDb = async () => {
  try {
    mongoose.set("strictQuery", false);
    const remoteDbURI = process.env.remoteAtlasDbConnectionURI;
    await mongoose.connect(remoteDbURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Remote Atlas Database Connection Successful!");
  } catch (err) {
    console.log("Remote Atlas Database Connection Failed!", err);
  }
};

export default connectToRemoteDb;
