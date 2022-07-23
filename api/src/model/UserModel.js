import UserSchema from "./UserSchema.js";

// UserModel is for CRUD operations on the User collection

export const addUser = async (users) => {
  // users is an object
  return await UserSchema(users).save();
};

// filter out the user from the database
export const getUser = async (filter) => {
  return await UserSchema.findOne(filter);
};
