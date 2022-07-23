import { useState } from "react";
import { Alert, Form } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { MainLayout } from "../Components/MainLayout";
import { postNewUser } from "../helpers/axiosHelper";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

let initialState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export const Register = () => {
  const [userRegisterForm, setUserRegisterForm] = useState({}); // Initialize form data with empty object // userRegisterForm is an object // setUserRegisterForm is a function
  const [resp, setResp] = useState({}); // Initialize response data with empty object // resp is an object // setResp is a function

  const handleOnChange = (e) => {
    // e is the event that is passed in as an argument
    const { name, value } = e.target;
    setUserRegisterForm({ ...userRegisterForm, [name]: value }); // Set the form data to the new value // userRegisterForm is an object // setUserRegisterForm is a function
  };

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    console.log(userRegisterForm);

    const { confirmPassword, ...userData } = userRegisterForm; // userData is an object // user is an object
    if (confirmPassword !== userData.password) {
      return alert("Passwords do not match"); // If the passwords do not match, return an alert
    }

    const { status, message } = await postNewUser(userData);
    // status is a string // message is a string
    toast[status](message); // Toast is a function // status is a string // message is a string
    status === "success" && setUserRegisterForm(initialState);
    setResp({ status, message });
  };

  return (
    <MainLayout>
      <div className="register-page landing d-flex justify-content-center mt-1">
        <div className="register-form border bg-light shadow-lg p-5">
          <h3>Register as a new user</h3>
          <Form onSubmit={handleOnSubmit}>
            {resp.message && (
              <Alert variant={resp.status === "success" ? "success" : "danger"}>
                {resp.message}
              </Alert>
            )}
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>First Name</Form.Label>
              <Form.Control
                name="firstName"
                type="text"
                placeholder="Enter first name"
                required
                onChange={handleOnChange}
                value={userRegisterForm.firstName} // uncontrolled input field
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Last Name</Form.Label>
              <Form.Control
                name="lastName"
                type="text"
                placeholder="Enter last name"
                required
                onChange={handleOnChange}
                value={userRegisterForm.lastName}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                name="email"
                type="email"
                placeholder="Enter email"
                required
                onChange={handleOnChange}
                value={userRegisterForm.email}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                name="password"
                type="password"
                placeholder="Password"
                required
                onChange={handleOnChange}
                value={userRegisterForm.password}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                name="confirmPassword"
                type="password"
                placeholder="Confirm password"
                required
                onChange={handleOnChange}
                value={userRegisterForm.confirmPassword}
              />
            </Form.Group>

            <Button variant="primary" type="submit" value="Register">
              Register
            </Button>
          </Form>
          <div className="text-end mt-3">
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
