import React from 'react'
import {Routes, Route} from "react-router"
import HomePage from './pages/HomePage'
import CreateProject from './pages/CreateProject'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage/>}/>
        <Route path="/create-project" element={<CreateProject/>}/>
      </Routes>
    </div>
  )
}

export default App
