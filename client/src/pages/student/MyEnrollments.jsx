import React, { useContext,useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const MyEnrollments = () => {

  const { enrolledCourses, calculateCourseDuration,navigate,userData , fetchUserEnrolledCourses,backendurl , calculateNoofLectures ,getToken, fetchUserData, progressRefreshTrigger  } = useContext(AppContext);
  const [progressArray, setProgressArray] = useState([])
  const [searchParams] = useSearchParams();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Check if user is returning from Stripe payment
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      console.log('🎉 Payment success detected:', sessionId);
      console.log('📋 Current enrolled courses before refresh:', enrolledCourses.length);
      
      toast.success('Payment successful! Welcome to your new course!');
      
      // Multiple refresh attempts to ensure enrollment is captured
      const refreshEnrollments = async () => {
        console.log('🔄 Starting enrollment refresh sequence...');
        
        // First refresh immediately
        if (fetchUserEnrolledCourses) {
          await fetchUserEnrolledCourses();
          console.log('✅ First enrollment refresh complete');
        }
        
        if (fetchUserData) {
          await fetchUserData();
        }
        
        // Second refresh after 2 seconds (backend processing time)
        setTimeout(async () => {
          console.log('🔄 Second enrollment refresh attempt...');
          if (fetchUserEnrolledCourses) {
            await fetchUserEnrolledCourses();
            console.log('✅ Second enrollment refresh complete');
          }
        }, 2000);
        
        // Final refresh after 5 seconds
        setTimeout(async () => {
          console.log('🔄 Final enrollment refresh attempt...');
          if (fetchUserEnrolledCourses) {
            await fetchUserEnrolledCourses();
            console.log('✅ Final enrollment refresh complete');
            console.log('📋 Final enrolled courses count:', enrolledCourses.length);
          }
        }, 5000);
      };
      
      refreshEnrollments();
    }
  }, [searchParams, fetchUserEnrolledCourses, fetchUserData]);

  const forceRefreshEnrollments = async () => {
    try {
      console.log('🔄 Manual enrollment refresh triggered');
      console.log('📋 Current enrolled courses count:', enrolledCourses.length);
      
      toast.info('Refreshing enrollments...', { autoClose: 1000 });
      
      if (fetchUserEnrolledCourses) {
        await fetchUserEnrolledCourses();
        console.log('✅ Enrollment refresh complete');
        toast.success('Enrollments refreshed successfully!');
      }
      
      if (fetchUserData) {
        await fetchUserData();
      }
      
    } catch (error) {
      console.error('❌ Manual enrollment refresh failed:', error);
      toast.error('Failed to refresh enrollments');
    }
  };

  const getCourseProgress = async () => {
    try {
      setIsRefreshing(true);
      console.log('🔄 Refreshing progress for', enrolledCourses.length, 'courses');
      
      const token = await getToken();
      const tempProgressArray = await Promise.all(
        enrolledCourses.map(async (course, index) => {
          console.log('📊 Getting progress for course:', course.courseTitle);
          
          const { data } = await axios.post(`${backendurl}/api/user/get-course-progress`, { courseId: course._id }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          let totalLectures = calculateNoofLectures(course);
          const lectureCompleted = data.progressData ? data.progressData.lectureCompleted.length : 0;
          
          console.log(`📈 Course ${index + 1}: ${lectureCompleted}/${totalLectures} completed`);
          
          return { totalLectures, lectureCompleted };
        })
      );
      
      console.log('✅ Progress update complete:', tempProgressArray);
      setProgressArray(tempProgressArray);
    } catch (error) {
      console.error('❌ Progress update failed:', error);
      toast.error(error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (enrolledCourses.length > 0) {
      getCourseProgress();
    }
  }, [enrolledCourses]);

  // Listen for progress refresh trigger from other components
  useEffect(() => {
    console.log('🔔 Progress refresh trigger changed:', progressRefreshTrigger);
    
    if (progressRefreshTrigger > 0 && enrolledCourses.length > 0) {
      console.log('🔄 Triggering progress refresh...');
      getCourseProgress().then(() => {
        toast.success('Progress updated successfully!', {
          position: "bottom-right",
          autoClose: 2000,
        });
      });
    }
  }, [progressRefreshTrigger, enrolledCourses]);

  // Force refresh when component mounts (user navigates back from player)
  useEffect(() => {
    if (enrolledCourses.length > 0) {
      console.log('🔄 Component mounted, refreshing progress...');
      getCourseProgress();
    }
  }, []); // Empty dependency array to run only on mount

  // Add effect to refresh progress when component comes into focus
  useEffect(() => {
    const handleFocus = () => {
      if (enrolledCourses.length > 0) {
        console.log('🔄 Window gained focus, refreshing progress...');
        getCourseProgress();
      }
    };

    // Add event listener for when user returns to this tab/window
    window.addEventListener('focus', handleFocus);
    
    // Also refresh when component mounts (user navigates back)
    const handleVisibilityChange = () => {
      if (!document.hidden && enrolledCourses.length > 0) {
        console.log('🔄 Page became visible, refreshing progress...');
        getCourseProgress();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enrolledCourses]);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 py-8">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          {/* Header Section */}
          <div className="mb-8 flex justify-between items-center">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                My Enrollments
              </h1>
              <p className="text-gray-600">Track your learning progress and continue your courses</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={forceRefreshEnrollments}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Enrollments
              </button>
              <button 
                onClick={getCourseProgress}
                disabled={isRefreshing}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200"
              >
                <svg 
                  className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isRefreshing ? 'Refreshing...' : 'Refresh Progress'}
              </button>
            </div>
          </div>

          {/* Enrollments Table Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative">
            {isRefreshing && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-2xl">
                <div className="flex items-center gap-3 bg-blue-100 px-6 py-3 rounded-lg">
                  <svg className="w-5 h-5 animate-spin text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-blue-800 font-medium">Updating progress...</span>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm uppercase tracking-wider">Course</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm uppercase tracking-wider hidden md:table-cell">Duration</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm uppercase tracking-wider hidden sm:table-cell">Progress</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-900 text-sm uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {enrolledCourses.map((course, index) => {
                    const progress = progressArray[index];
                    const progressPercentage = progress ? Math.round((progress.lectureCompleted / progress.totalLectures) * 100) : 0;
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                        {/* Course Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex-shrink-0">
                              <img 
                                src={course.courseThumbnail} 
                                alt={course.courseTitle}
                                className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover shadow-md"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm lg:text-base font-semibold text-gray-900 truncate">
                                {course.courseTitle}
                              </h3>
                              <p className="text-xs lg:text-sm text-gray-500 mt-1">
                                by GreatStack
                              </p>
                              {/* Mobile Progress */}
                              <div className="mt-2 sm:hidden">
                                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                  <span>{progress ? `${progress.lectureCompleted}/${progress.totalLectures} lectures` : 'N/A'}</span>
                                  <span>{progressPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${progressPercentage}%` }}
                                  ></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Duration */}
                        <td className="px-6 py-4 hidden md:table-cell">
                          <div className="flex items-center text-sm text-gray-700">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {calculateCourseDuration(course)}
                          </div>
                        </td>

                        {/* Progress */}
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-700 font-medium">
                                {progress ? `${progress.lectureCompleted}/${progress.totalLectures}` : 'N/A'} lectures
                              </span>
                              <span className="text-blue-600 font-semibold">{progressPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${progressPercentage}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => navigate('/player/' + course._id)}
                            className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-semibold shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 ${
                              progress && progress.lectureCompleted === progress.totalLectures
                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                            }`}
                          >
                            {progress && progress.lectureCompleted === progress.totalLectures ? (
                              <>
                                <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Completed
                              </>
                            ) : (
                              <>
                                <svg className="w-3 h-3 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Continue
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Empty State (if no enrollments) */}
          {enrolledCourses.length === 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Enrollments Yet</h3>
              <p className="text-gray-600 mb-6">Start your learning journey by enrolling in courses</p>
              <button onClick={() => navigate('/course-list')} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200">
                Browse Courses
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyEnrollments;
