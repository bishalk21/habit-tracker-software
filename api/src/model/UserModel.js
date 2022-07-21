import UserSchema from "./UserSchema.js";

// UserModel is for CRUD operations on the User collection

export const addUser = async (users) => {
  // users is an object
  return await UserSchema(users).save();
};
