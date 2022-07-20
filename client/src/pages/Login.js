import React from "react";
import { Form } from "react-bootstrap";
import Button from "react-bootstrap/Button";

export const Login = () => {
  return (
    <div className="register-page landing d-flex justify-content-center mt-1">
      <div className="register-form border bg-light shadow-lg p-5">
        <h3>Welcome Back</h3>
        <Form>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control name="email" type="email" placeholder="Enter email" />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              name="password"
              type="password"
              placeholder="Password"
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Login
          </Button>
        </Form>
      </div>
    </div>
  );
};
