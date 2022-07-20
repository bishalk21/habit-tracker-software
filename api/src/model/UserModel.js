import UserSchema from "./UserSchema.js";

// UserModel is for CRUD operations on the User collection

export const addUser = async (users) => {
  return await UserSchema(users).save();
};
