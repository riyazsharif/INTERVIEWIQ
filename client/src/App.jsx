import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import { useEffect } from 'react'
import { useDispatch } from "react-redux"
import { setUserData } from './redux/userSlice.js'
import InterviewPage from './pages/InterviewPage.jsx'
import api from './utils/api.js'

function App() {
 
  const dispatch=useDispatch()
   
  useEffect(() => {
    const getUser = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        dispatch(setUserData(null))
        return
      }

      try {
        const result = await api.get("/api/user/current-user")
        dispatch(setUserData(result.data))
        
      } catch (error) {
        console.log(error);
        dispatch(setUserData(null))
      }
    }
    getUser()
  },[dispatch])
  return (
    <Routes>
      <Route path='/' element={<Home/>} />
      <Route path='/auth' element={<Auth/>} />
      <Route path='/interview' element={<InterviewPage/>} />
   </Routes>
  )
}

export default App
