import React from 'react'
import {Routes, Route} from "react-router"
import HomePage from './pages/HomePage'
import CreateProject from './pages/CreateProject'
import Login from './pages/Login'
import Signup from './pages/Signup'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/create-project" element={<CreateProject/>}/>
        <Route path="/home" element={<HomePage/>}/>
        <Route path="/signup" element={<Signup/>}/>
      </Routes>
    </div>
  )
}

export default App
