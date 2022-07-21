import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    status: {
      // status is a string that can be either "active" or "inactive" // this is to check if the user is active or not or if the user is valid or not
      type: String,
      default: "inactive",
    },
    firstName: {
      type: String,
      required: true,
      minlength: 5,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 5,
    },
    email: {
      type: String,
      required: true,
      minlength: 6,
      unique: true,
      index: 1,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", UserSchema);
