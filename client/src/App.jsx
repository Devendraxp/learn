import React from 'react'
import { Routes ,Route, useLocation} from 'react-router-dom'
import CourseList from './pages/student/CourseList'
import CourseDetailes from './pages/student/CourseDetailes'
import MyEnrollments from './pages/student/MyEnrollments'
import Home from './pages/student/Home'
import Player from './pages/student/Player'
import Loading from './components/student/Loading'
import Addcourse from './pages/educator/Addcourse'
import Dashboard from './pages/educator/Dashboard'
import MyCourses from './pages/educator/MyCourses'
import Educator from './pages/educator/Educator'
import StudentEnrolled from './pages/educator/StudentEnrolled'
import ApplyEducator from './pages/educator/ApplyEducator'
import MyApplications from './pages/educator/MyApplications'
import AdminApplications from './pages/educator/AdminApplications'
import AdminApplicationReview from './pages/educator/AdminApplicationReview'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminEducators from './pages/admin/AdminEducators'
import AdminStudents from './pages/admin/AdminStudents'
import AdminCourses from './pages/admin/AdminCourses'
import RequireAdmin from './components/admin/RequireAdmin'
import Navbar from './components/student/Navbar.jsx'
import Footer from './components/student/Footer'
// TestingPanel removed — development-only testing UI deleted
import "quill/dist/quill.snow.css"
import {ToastContainer,toast} from 'react-toastify'
import { useUser } from '@clerk/clerk-react'

const App = () => {

  const location = useLocation();
  const { user, isLoaded } = useUser();
  const isEducatorRoute = location.pathname.startsWith('/educator');

  return (
    <div className='text-default min-h-screen bg-white'>
      <ToastContainer/>
 
      {!isEducatorRoute && <Navbar/>}
      
        <Routes>
          <Route path='/educator' element={<Educator/>}>
              <Route index element={<Dashboard/>}/>
              <Route path='dashboard' element={<Dashboard/>}/>
              <Route path='add-course' element={<Addcourse/>}/>
              <Route path='addcourse' element={<Addcourse/>}/>
              <Route path='my-courses' element={<MyCourses/>}/>
              <Route path='mycourses' element={<MyCourses/>}/>
              <Route path='students-enrolled' element={<StudentEnrolled/>}/>
              <Route path='studentenrolled' element={<StudentEnrolled/>}/>
              <Route path='apply' element={<ApplyEducator/>} />
              <Route path='my-applications' element={<MyApplications/>} />
          </Route>
          
          <Route path='/admin' element={<RequireAdmin><AdminLayout/></RequireAdmin>}>
            <Route index element={<AdminDashboard/>} />
            <Route path='dashboard' element={<AdminDashboard/>} />
            <Route path='educators' element={<AdminEducators/>} />
            <Route path='students' element={<AdminStudents/>} />
            <Route path='courses' element={<AdminCourses/>} />
            <Route path='applications' element={<AdminApplications/>} />
            <Route path='applications/:id' element={<AdminApplicationReview/>} />
          </Route>
          <Route path='/' element={<Home/>}/>
          <Route path='/course-list' element={<CourseList/>}/>
          <Route path='/course-list/:input' element={<CourseList/>}/>
          <Route path='/course/:id' element={<CourseDetailes/>}/>
          <Route path='/myenrollments' element={<MyEnrollments/>}/>
          <Route path='/player/:courseId' element={<Player/>}/>
          <Route path='/loading/*' element={<Loading/>}/>

        </Routes>
      {!isEducatorRoute && <Footer/>}
    </div>
  )
}

export default App