import SigninForm from "./components/forms/SigninForm"
import SignupForm from "./components/forms/SignupForm"
import MainPage from "./components/pages/MainPage"
import { Navigate, Route, Routes } from "react-router-dom"

const PrivateRoutes = ({ children }) => {
  const isLoggedIn = localStorage.getItem('user:token') !== null;

  if (!isLoggedIn) {
    if (['/sign-in','/sign-up'].includes(window.location.pathname))
      return children;
    return <Navigate to='/sign-in' />;
  } else if (isLoggedIn && ['/sign-in','/sign-up'].includes(window.location.pathname)) {
    return <Navigate to='/' />
  }
  return children;
}

function App() {

  return (
    <Routes>
      <Route path="/" element={<PrivateRoutes><MainPage /></PrivateRoutes>} />
      <Route path="/sign-in" element={<PrivateRoutes><SigninForm /></PrivateRoutes>} />
      <Route path="/sign-up" element={<PrivateRoutes><SignupForm /></PrivateRoutes>} />
    </Routes>
  )
}

export default App
