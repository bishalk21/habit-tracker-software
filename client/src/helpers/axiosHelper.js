import axios from "axios";

const rootUrl = "http://localhost:8000";
const UserP = rootUrl + "/api/v1/user/";

const postNewUser = async (user) => {
  try {
  } catch (error) {
    return {
      status: "error",
      message: error.message,
    };
  }
};
