import React from 'react'
import {Routes, Route, useNavigate, useLocation} from "react-router"
import HomePage from './pages/HomePage'
import CreateProject from './pages/CreateProject'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ScreensPage from './pages/ScreensPage'
import CreateScreen from './pages/CreateScreen'
import ProtectedRoute from './components/ProtectedRoute'
import { useEffect } from 'react'

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      // Remove the token from the URL for security and cleanliness
      window.history.replaceState({}, document.title, "/home");
      navigate("/home");
    }
  }, [location, navigate]);
  
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/create-project" element={<ProtectedRoute><CreateProject/></ProtectedRoute>}/>
        <Route path="/home" element={<ProtectedRoute><HomePage/></ProtectedRoute>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/project/:projectId" element={<ProtectedRoute><ScreensPage/></ProtectedRoute>}/>
      </Routes>
    </div>
  )
}

export default App