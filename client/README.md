# Habit Tracker System

# Starting up the Project

- use npx create-react-app to create a new react app
- clean the app.js, app.css and logo.png files
- install react-router-dom, react-bootstrap
- integrate font awesome CDN in index.html
- integrate bootstrap css in index.js

# React-Bootstrap

react-bootstrap is a library that provides a lot of components for React. It is for rapid development of responsive, mobile-friendly web pages.

# React-Router-Dom

react-router-dom is a library that allows you to use react-router in your react app. It is for creating multi-page applications.

- Link, NavLink, BrowserRouter, HashRouter, Route, Switch, Redirect, Prompt, withRouter, Link, NavLink, Prompt, Redirect, Route, Router, RouteComponentProps, StaticRouter, Switch, match, useHistory, useLocation, useParams, useRouteMatch, useRouteMatch, withRouter
- Link is a component that renders an <a> element. It is used to link to other pages.
- BrowserRouter is a component that renders a <div> element. It is used to render a single page application.
- Route is a component that renders a <div> element. It is used to render a page.
- We use Link to link to other pages. We use BrowserRouter to render a single page application. We use Route to render a page.
- <Link to="/">Home</Link>

# React-toastify

react-toastify is a library that allows you to use toast notifications in your react app. It is for pop up notifications.

# use-Ref

useRef is a hook that lets you access the DOM node of a component. It helps in accessing data of a component.

# Uncontrolled input field

onControlled is a hook that lets you control the value of an input field.

In the React rendering lifecycle, the value attribute on form elements will override the value in the DOM. With an uncontrolled component, you often want React to specify the initial value, but leave subsequent updates uncontrolled. To handle this case, you can specify a defaultValue attribute instead of value. Changing the value of defaultValue attribute after a component has mounted will not cause any update of the value in the DOM.

- value = {userRegisterForm.[key]} in form is controlled by DOM itself

# useRef()

- The useRef Hook allows you to persist values between renders.
- It can be used to store a mutable value that does not cause a re-render when updated.
- It can be used to access a DOM element directly.
