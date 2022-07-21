import express from "express";

import { addUser } from "../model/UserModel";

const router = express.Router(); // eslint-disable-line new-cap

router.post("/", async (req, res, next) => {
  try {
    const user = await addUser(req.body);
    res.json({
      status: "success",
      message: "User added successfully",
      user,
    });
  } catch (error) {
    next(error);
  }
});
