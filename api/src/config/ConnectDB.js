import mongoose from "mongoose";

const ConnectDB = () => {
  try {
    const MONGO_CLIENT = "mongodb://localhost/habit-tracker";
    const con = mongoose.connect(MONGO_CLIENT);
    if (con) {
      console.log("Connected to Mongo DB");
    }
  } catch (error) {
    console.log(error);
  }
};

export default ConnectDB;
