import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import { useEffect } from 'react'
import axios from 'axios'
import { useDispatch } from "react-redux"
import { setUserData } from './redux/userSlice.js'
import InterviewPage from './pages/InterviewPage.jsx'
export const serverUrl = "http://localhost:8000"
function App() {
 
  const dispatch=useDispatch()
   
  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await axios.get(serverUrl + "/api/user/current-user", { withCredentials: true })
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
