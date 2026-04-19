/* eslint-disable no-unused-vars */
import { createContext, useContext, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import { useNavigate } from "react-router-dom";
import humanizeDuration from "humanize-duration";
import axios from 'axios'
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from 'react-toastify'


// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext({});

export const AppContextProvider = (props) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const [allcourses, setAllcourses] = useState([]);
  const [isEducator, setIsEducator] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData, setUserData] = useState(null);
  const [progressRefreshTrigger, setProgressRefreshTrigger] = useState(0);
  const backendurl = import.meta.env.VITE_BACKEND_URL
      ? import.meta.env.VITE_BACKEND_URL.replace(/['"]/g, '')
      : (import.meta.env.DEV
          ? 'http://localhost:5000'
          : window.location.origin);

  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { user } = useUser();

  const fetchallcourses = async () => {
    try {
      const { data } = await axios.get(backendurl + '/api/course/all');
      if (data.success) {
        setAllcourses(data.courses);
      } else {
        toast.error(data.message);
      }

    } catch (error) {
      console.error('Full error object:', error);
      
      if (error.response) {

        console.error('Response error:', error.response.data);
        console.error('Status:', error.response.status);
        toast.error(error.response.data?.message || `Server Error: ${error.response.status}`);
      } else if (error.request) {
        // Request was made but no response received
        console.error('Request error:', error.request);
        toast.error('No response from server. Please check your internet connection.');
      } else {
        console.error('General error:', error.message);
        toast.error(error.message || 'An unexpected error occurred');
      }
    }
    }
  

  const fetchUserEnrolledCourses = async () => {
    try {
      console.log('🎯 fetchUserEnrolledCourses: Starting...');
      const token = await getToken();
      
      if (!token) {
        console.log('❌ fetchUserEnrolledCourses: No auth token available');
        setEnrolledCourses([]);
        return;
      }

      console.log('🔑 fetchUserEnrolledCourses: Token obtained, making API call...');
      const { data } = await axios.get(`${backendurl}/api/user/enrolled-courses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('📥 fetchUserEnrolledCourses: API Response:', data);
      console.log('📚 fetchUserEnrolledCourses: Response success:', data.success);
      console.log('📚 fetchUserEnrolledCourses: Enrolled courses array:', data.enrolledCourses);
      console.log('📚 fetchUserEnrolledCourses: Count:', data.enrolledCourses?.length || 0);
      
      if (data.success) {
        const courses = data.enrolledCourses || [];
        setEnrolledCourses(courses.reverse());
        console.log('✅ fetchUserEnrolledCourses: Successfully set', courses.length, 'enrolled courses');
      } else {
        console.log('❌ fetchUserEnrolledCourses: API returned error:', data.message);
        toast.error(data.message);
        setEnrolledCourses([]);
      }

    } catch (error) {
      console.error('❌ fetchUserEnrolledCourses error:', error);
      
      // Detailed axios error handling
      if (error.response) {
        console.error('🔴 Server responded with error:', error.response.data);
        console.error('🔴 Status code:', error.response.status);
        toast.error(error.response.data?.message || `Error ${error.response.status}: Failed to fetch enrolled courses`);
      } else if (error.request) {
        console.error('🔴 Network error:', error.request);
        toast.error('Network error. Please check your connection.');
      } else {
        console.error('🔴 Unexpected error:', error.message);
        toast.error(error.message || 'Failed to fetch enrolled courses');
      }
      setEnrolledCourses([]);
    }
  }

  // Fetch UserData
  const fetchUserData = async () => {
    console.log('🔍 fetchUserData called, user role:', user?.publicMetadata?.role);
    
    if (user?.publicMetadata?.role === 'educator') {
      console.log('✅ Setting isEducator to true from fetchUserData');
      setIsEducator(true);
    } else {
      console.log('❌ User is not an educator, setting isEducator to false');
      setIsEducator(false);
    }

    try {
      const token = await getToken();

      const { data } = await axios.get(backendurl + '/api/user/data', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (data.success) {
        setUserData(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error(error.message);
    }
  }

  const calculateRating = (course) => {
    if (course.courseRatings.length === 0) {
      return 0;
    }
    let totalrating = 0;
    course.courseRatings.forEach(rating => {
      totalrating += rating.rating
    });

    return totalrating / course.courseRatings.length;
  }

  useEffect(() => {
    fetchallcourses();
    if (user) {
      fetchUserData();
      fetchUserEnrolledCourses();
    }
  }, [user])

  // Monitor user role changes
  useEffect(() => {
    console.log('🔍 User role changed:', user?.publicMetadata?.role);
    if (user?.publicMetadata?.role === 'educator') {
      console.log('✅ Setting isEducator to true from role change monitor');
      setIsEducator(true);
    } else {
      console.log('❌ Setting isEducator to false from role change monitor');
      setIsEducator(false);
    }
  }, [user?.publicMetadata?.role])

  //to calculate chapter time
  const calculateChapterTime = (chapter) => {
    let time = 0;
    chapter.chapterContent.map((lecture) => time += lecture.lectureDuration)
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] })
  }

  //to calculate course duration of the course
  const calculateCourseDuration = (course) => {
    let time = 0;
    course.courseContent.map((chapter) => {
      chapter.chapterContent.map(
        (lecture) => time += lecture.lectureDuration
      )
    })
    return humanizeDuration(time * 60 * 1000, { units: ["h", "m"] });
  }

  //function calculate to no. of lectures in the course
  const calculateNoofLectures = (course) => {
    let totalLectures = 0;
    course.courseContent.forEach(chapter => {
      if (Array.isArray(chapter.chapterContent)) {
        totalLectures += chapter.chapterContent.length
      }
    });
    return totalLectures;

  }

  const triggerProgressRefresh = () => {
    console.log('🔔 AppContext: Triggering progress refresh, current trigger:', progressRefreshTrigger);
    setProgressRefreshTrigger(prev => {
      const newValue = prev + 1;
      console.log('🔔 AppContext: New trigger value:', newValue);
      return newValue;
    });
  };

  // Educator API Functions
  const getEducatorDashboardData = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(backendurl + '/api/educator/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (data.success) {
        return data.data;
      } else {
        toast.error(data.message);
        return null;
      }
    } catch (error) {
      console.error('Error fetching educator dashboard data:', error);
      if (error.response) {
        toast.error(error.response.data?.message || `Server Error: ${error.response.status}`);
      } else if (error.request) {
        toast.error('No response from server. Please check your internet connection.');
      } else {
        toast.error(error.message || 'Failed to fetch dashboard data');
      }
      return null;
    }
  };

  const updateRoleToEducator = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(backendurl + '/api/educator/update-role', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        return true;
      } else {
        toast.error(data.message || 'Failed to apply for educator role');
        return false;
      }
    } catch (error) {
      console.error('Error updating role to educator:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to apply for educator role');
      return false;
    }
  };

  const getEnrolledStudentsData = async () => {
    try {
      const token = await getToken();
      
      const { data } = await axios.get(backendurl + '/api/educator/enrolled-students', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (data.success) {
        // Transform the purchase data to match the expected format
        const transformedData = data.data.map(purchase => ({
          student: {
            _id: purchase.userId._id,
            name: purchase.userId.name,
            imageUrl: purchase.userId.imageUrl,
            email: purchase.userId.email
          },
          courseTitle: purchase.courseId.courseTitle,
          purchaseDate: purchase.createdAt
        }));
        return transformedData;
      } else {
        toast.error(data.message);
        return [];
      }
    } catch (error) {
      console.error('Error fetching enrolled students data:', error);
      if (error.response) {
        toast.error(error.response.data?.message || `Server Error: ${error.response.status}`);
      } else if (error.request) {
        toast.error('No response from server. Please check your internet connection.');
      } else {
        toast.error(error.message || 'Failed to fetch enrolled students data');
      }
      return [];
    }
  };

  const getEducatorCourses = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(backendurl + '/api/educator/courses', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (data.success) {
        return data.courses;
      } else {
        toast.error(data.message);
        return [];
      }
    } catch (error) {
      console.error('Error fetching educator courses:', error);
      if (error.response) {
        toast.error(error.response.data?.message || `Server Error: ${error.response.status}`);
      } else if (error.request) {
        toast.error('No response from server. Please check your internet connection.');
      } else {
        toast.error(error.message || 'Failed to fetch educator courses');
      }
      return [];
    }
  };

  const deleteEducatorCourse = async (courseId) => {
    try {
      const token = await getToken();
      const { data } = await axios.delete(`${backendurl}/api/educator/courses/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        toast.success(data.message || 'Course deleted');
        return true;
      } else {
        toast.error(data.message || 'Failed to delete course');
        return false;
      }
    } catch (error) {
      console.error('Error deleting course:', error);
      if (error.response) {
        toast.error(error.response.data?.message || `Server Error: ${error.response.status}`);
      } else if (error.request) {
        toast.error('No response from server. Please check your internet connection.');
      } else {
        toast.error(error.message || 'Failed to delete course');
      }
      return false;
    }
  };

  const value = {
    currency,
    allcourses,
    navigate,
    calculateRating,
    isEducator,
    setIsEducator,
    calculateCourseDuration,
    calculateNoofLectures,
    calculateChapterTime,
    enrolledCourses,
    fetchUserEnrolledCourses,
    userData,
    fetchUserData,
    backendurl,
    getToken,
    progressRefreshTrigger,
    triggerProgressRefresh,
    // Educator functions
    getEducatorDashboardData,
    getEnrolledStudentsData,
    getEducatorCourses,
    deleteEducatorCourse,
    updateRoleToEducator
  }

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  )
}

// Keep a backward-compatible named export for older imports
export { AppContextProvider as AppcontextProvider };

