import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import humanizeDuration from 'humanize-duration';
import { AppContext } from '../../context/AppContext'; // Adjust path as needed
import { assets } from '../../assets/assets'; // Adjust path as needed
import YouTube from 'react-youtube';
import Rating from '../../components/student/Rating';
import axios from 'axios';
import { toast } from 'react-toastify';
 
const Player = () => {
  const {enrolledCourses, calculateChapterTime, backendurl, getToken, userData, fetchUserEnrolledCourses, triggerProgressRefresh} = useContext(AppContext);
  const {courseId} = useParams();
  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const [playerData, setPlayerData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [initialRating, setInitialRating] = useState(0);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  const getCourseData = () => {
    if (!enrolledCourses || enrolledCourses.length === 0) return;
    
    enrolledCourses.map((course) => {
      if (course._id === courseId) {
        setCourseData(course);
        course.courseRatings.map((item) => {
          if (item.userId === userData._id) {
            setInitialRating(item.rating);
          }
        });
      }
    });
  };

  // Calculate course progress percentage
  const calculateProgressPercentage = () => {
    if (!courseData) {
      return 0;
    }
    
    // Create a fallback if progressData is null/undefined
    const safeProgressData = progressData || { lectureCompleted: [] };
    
    if (!safeProgressData.lectureCompleted) {
      safeProgressData.lectureCompleted = [];
    }
    
    const totalLectures = courseData.courseContent.reduce((total, chapter) => total + chapter.chapterContent.length, 0);
    const completedLectures = Array.isArray(safeProgressData.lectureCompleted) ? safeProgressData.lectureCompleted.length : 0;
    
    const percentage = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;
    
    return percentage;
  };

   const toggleSection = (index)=>{
    setOpenSections((prev)=>(
      {
        ...prev ,
        [index] : !prev[index]    //flip the state
      }
    ));
  }

  useEffect(()=>{
    if(enrolledCourses.length > 0) {
        getCourseData()
        getCourseProgress()  // Fetch progress data when component mounts
    }
  },[enrolledCourses])

  const markLectureAsCompleted = async (lectureId) => {
    try {
      setIsMarkingComplete(true);
      const token = await getToken();
      
      const response = await axios.post(backendurl + '/api/user/update-course-progress', { courseId, lectureId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const { data } = response;

      if (data.success) {
        toast.success(data.message);
        
        // Immediately update local state with backend returned progress data
        if (data.progressData) {
          setProgressData(data.progressData);
        }
        
        // Trigger progress refresh for other components (like MyEnrollments)
        if (triggerProgressRefresh) {
          triggerProgressRefresh();
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error marking lecture as completed:', error);
      toast.error(error.message);
    } finally {
      setIsMarkingComplete(false);
    }
  };

  const getCourseProgress = async () => {
    try {
      if (!courseId) {
        return;
      }
      
      const token = await getToken();
      const requestPayload = { courseId };
      
      const response = await axios.post(backendurl + '/api/user/get-course-progress', requestPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { data } = response;

      if (data.success) {
        // Ensure we have a proper progress data structure
        const progressData = data.progressData || { lectureCompleted: [] };
        
        // Make sure lectureCompleted is always an array
        if (!Array.isArray(progressData.lectureCompleted)) {
          progressData.lectureCompleted = [];
        }
        
        setProgressData(progressData);
        
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error getting progress:', error);
      toast.error(error.message);
    }
  };

  const handleRate = async (rating) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(backendurl + '/api/user/add-rating', { courseId, rating }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        toast.success(data.message);
        fetchUserEnrolledCourses();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(()=>{
    getCourseProgress();
  },[])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20">
      <div className="container mx-auto px-4 lg:px-8 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Course Structure */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Course Structure</h2>
              </div>
              <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 space-y-3">
                {courseData && courseData.courseContent.map((chapter,index)=>(
                  <div className="border border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-xl overflow-hidden hover:shadow-md transition-all duration-300" key={index}>
                    <div className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-blue-50 transition-colors duration-200" onClick={() => toggleSection(index)}>
                      <div className="flex items-center gap-3">
                        <div className={`transform transition-transform duration-300 ${openSections[index] ? 'rotate-180' : ''} bg-blue-100 rounded-full p-1.5`}>
                          <img className="w-3 h-3" src={assets.down_arrow_icon} alt="arrow icon" />
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm">{chapter.chapterTitle}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-medium text-blue-600">{chapter.chapterContent.length} lectures</p>
                        <p className="text-xs text-gray-500">{calculateChapterTime(chapter)}</p>
                      </div>
                    </div>

                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openSections[index] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="bg-white border-t border-gray-100">
                        <ul className="divide-y divide-gray-50">
                          {chapter.chapterContent.map((lecture,idx) =>(
                           <li key={idx} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors duration-200 cursor-pointer" onClick={()=>{
                             setPlayerData({...lecture, chapterIndex: index, lectureIndex: idx})
                           }}>
                              <div className={`rounded-full p-1.5 ${playerData && playerData.lectureTitle === lecture.lectureTitle ? 'bg-green-500' : 'bg-gray-200'}`}>
                                <img src={progressData && Array.isArray(progressData.lectureCompleted) && progressData.lectureCompleted.includes(lecture.lectureId) ? assets.blue_tick_icon : assets.play_icon} alt="play icon" className="w-3 h-3" />
                              </div>
                              <div className="flex items-center justify-between w-full">
                                <p className={`font-medium text-xs flex-1 ${playerData && playerData.lectureTitle === lecture.lectureTitle ? 'text-blue-600' : 'text-gray-700'}`}>
                                  {lecture.lectureTitle}
                                </p>
                                <span className="text-xs text-gray-500 font-medium ml-2">
                                  {humanizeDuration(lecture.lectureDuration * 60 * 1000,{units:['h','m']})}
                                </span>
                              </div>
                           </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Rating Section */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Rate this Course</h3>
                </div>
                <div className="mt-3">
                  <Rating initialRating={initialRating} onRate={handleRate}/>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Video Player */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              {playerData ? (
                <div>
                  {/* Video Player */}
                  <div className="relative">
                    <YouTube 
                      videoId={playerData.lectureUrl.split('/').pop()} 
                      iframeClassName="w-full aspect-video"
                      opts={{
                        playerVars: {
                          autoplay: 1,
                          modestbranding: 1,
                          rel: 0
                        }
                      }}
                    />
                  </div>
                  
                  {/* Video Info */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                            Chapter {playerData.chapterIndex + 1}
                          </span>
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                            Lecture {playerData.lectureIndex + 1}
                          </span>
                        </div>
                        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                          {playerData.lectureTitle}
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            {humanizeDuration(playerData.lectureDuration * 60 * 1000, {units: ['h', 'm']})}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0v-.5A1.5 1.5 0 0114.5 6c.526 0 .988-.27 1.256-.679a6.012 6.012 0 011.912 2.706c.092.282.132.587.132.896V12a6 6 0 11-12 0V8.923c0-.309.04-.614.132-.896z" clipRule="evenodd" />
                            </svg>
                            HD Quality
                          </span>
                        </div>
                      </div>
                      {/* <div className="flex justify-between items-center mt-1">
                        <p>{playerData.chapter}.{playerData.lecture} {playerData.lectureTitle}</p>
                      </div> */}
                      
                      <button 
                        onClick={() => markLectureAsCompleted(playerData.lectureId)} 
                        disabled={isMarkingComplete}
                        className={`inline-flex items-center px-4 py-2 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                          progressData && Array.isArray(progressData.lectureCompleted) && progressData.lectureCompleted.includes(playerData.lectureId)
                            ? 'bg-gray-500 cursor-not-allowed' 
                            : isMarkingComplete 
                              ? 'bg-yellow-500 cursor-wait' 
                              : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                        }`}
                      >
                        {isMarkingComplete ? (
                          <>
                            <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Marking...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {progressData && Array.isArray(progressData.lectureCompleted) && progressData.lectureCompleted.includes(playerData.lectureId) ? 'Completed' : 'Mark Complete'}
                          </>
                        )}
                      </button>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-6">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Course Progress</span>
                        <span>{calculateProgressPercentage()}% Complete</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500" 
                          style={{width: `${calculateProgressPercentage()}%`}}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
                        <span>
                          {progressData && Array.isArray(progressData.lectureCompleted) ? progressData.lectureCompleted.length : 0} lectures completed
                        </span>
                        <span>
                          {courseData ? 
                            courseData.courseContent.reduce((total, chapter) => total + chapter.chapterContent.length, 0) 
                            : 0} total lectures
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : courseData ? (
                <div className="relative">
                  <img 
                    src={courseData.courseThumbnail} 
                    alt="Course Thumbnail" 
                    className="w-full aspect-video object-cover" 
                  />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">Ready to Start Learning?</h3>
                      <p className="text-white/80">Select a lecture from the course structure to begin</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-8 16l8-8m0 8l-8-8" />
                      </svg>
                    </div>
                    <p className="text-gray-500 font-medium">Loading course content...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Player;