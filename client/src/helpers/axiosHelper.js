import axios from "axios";

const rootUrl = "http://localhost:8000";
const UserP = rootUrl + "/api/v1/user/";

// postNewUser is for registering a new user
const postNewUser = async (user) => {
  // user is an object
  try {
    const response = await axios.post(UserP, user);
    // console.log(response);
    return response.data; // data is actually the user object
  } catch (error) {
    return {
      status: "error",
      message: error.message,
    };
  }
};
