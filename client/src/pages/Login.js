import React, { useRef } from "react";
import { Form } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import { MainLayout } from "../Components/MainLayout";

export const Login = () => {
  const emailRef = useRef(); // creates a refrence
  const passwordRef = useRef();

  const handleOnSubmit = (e) => {
    e.preventDefault();
    const email = emailRef.current.value;
    const password = passwordRef.current.value;
    console.log(email, password);
  };

  return (
    <MainLayout>
      <div className="register-page landing d-flex justify-content-center mt-5">
        <div className="register-form border bg-light shadow-lg p-5">
          <h3>Welcome Back</h3>
          <Form onSubmit={handleOnSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                ref={emailRef}
                type="email"
                placeholder="Enter email"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                ref={passwordRef}
                name="password"
                type="password"
                placeholder="Password"
              />
            </Form.Group>

            <Button variant="primary" type="submit" value="Login">
              Login
            </Button>
          </Form>
          <div className="text-center mt-3">
            Are you new User? <a href="/register">Register</a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};
