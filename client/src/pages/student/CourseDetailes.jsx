import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";
import { assets } from "../../assets/assets";
import Searchbar from "../../components/student/Searchbar";
import CourseCard from "../../components/student/CourseCard";
import humanizeDuration from "humanize-duration";
import Youtube from 'react-youtube';
import axios from 'axios';
import { toast } from 'react-toastify';

const CourseDetailes = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [openSections,setopenSections] = useState({});
  const [isalreadyEnrolled, setisalreadyEnrolled] = useState(false)
  const [loading, setLoading] = useState(true);
  const [playerdata,setPlayerdata] = useState(null);
  const { allcourses, currency, calculateRating, calculateCourseDuration, calculateNoofLectures, calculateChapterTime, backendurl, userData, getToken } = useContext(AppContext);

  const fetchAllCourse = async () => {
    try {
        setLoading(true);
        const {data} = await axios.get(backendurl + '/api/course/' + id );
        if(data.success){
          setCourseData(data.course);  // Changed from data.courseData to data.course
          setLoading(false);
        }
        else{
          toast.error(data.message);
          setLoading(false);
        }
    } catch (error) {
       console.error('Error fetching course:', error);
       toast.error(error.message);
       setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      fetchAllCourse();
    }
  }, [id])

  useEffect(()=>{
    if(userData && courseData){
      console.log('🔍 Checking enrollment status:');
      console.log('- Course ID:', courseData._id);
      console.log('- User enrolled courses:', userData.enrolledCourses);
      console.log('- Includes check:', userData.enrolledCourses?.includes(courseData._id));
      
      // Convert both to strings for comparison to handle ObjectId/string mismatch
      const isEnrolled = userData.enrolledCourses?.some(courseId => 
        courseId.toString() === courseData._id.toString()
      ) || false;
      
      console.log('- Final enrollment status:', isEnrolled);
      setisalreadyEnrolled(isEnrolled);
    }
  },[userData,courseData])



  const enrollCourse = async () => {
    try {
      if (!userData) {
        return toast.warn('Login to Enroll');
      }
      
      if (isalreadyEnrolled) {
        return toast.warn('Already Enrolled');
      }
      
      const token = await getToken();
      
      const { data } = await axios.post(backendurl + '/api/user/purchase', {
        courseId: courseData._id
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (data.success) {
        const { sessionUrl } = data;
        console.log('🚀 Redirecting to Stripe:', sessionUrl);
        window.location.replace(sessionUrl);
      } else {
        console.error('❌ Purchase failed:', data.message);
        toast.error(data.message);
      }
      
    } catch (error) {
      console.error('Enrollment error:', error);
      
      if (error.response) {
        toast.error(error.response.data?.message || `Error ${error.response.status}: Failed to enroll`);
      } else if (error.request) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error(error.message || 'Failed to enroll in course');
      }
    }
  }

  const toggleSection = (index) => {
    setopenSections((prev) => ({
      ...prev,
      [index]: !prev[index]    //flip the state
    }));
  }

  if (loading) {
    return <Loading />;
  }

  if (!courseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center p-8 max-w-md bg-white rounded-lg shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Course Not Found</h2>
            <p className="text-gray-500 mb-6">The course you're looking for could not be found or may have been removed.</p>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return courseData ? (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 py-8">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="flex lg:flex-row flex-col gap-8 items-start">
            
            {/* Left Column */}
            <div className="lg:w-2/3 w-full space-y-6">
              {/* Course Header Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow duration-300">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-6">
                  {courseData.courseTitle}
                </h1>
                <div className="prose prose-gray max-w-none">
                  <div className="text-base text-gray-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: courseData.courseDescription.slice(0, 200) + '...' }} />
                </div>
              </div>

              {/* Course Stats Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex flex-wrap items-center gap-6 mb-4">
                  <div className="flex items-center bg-amber-50 rounded-full px-4 py-2">
                    <span className="text-amber-600 font-bold text-base mr-2">{calculateRating(courseData)}</span>
                    <div className="flex mr-2">
                      {[...Array(5)].map((_, i) => (
                        <img key={i} src={assets.star} alt="star" className="w-5 h-5" />
                      ))}
                    </div>
                    <span className="text-gray-600 text-sm font-medium">
                      ({courseData.courseRatings?.length || 0} {(courseData.courseRatings?.length || 0) !== 1 ? "Reviews" : "Review"})
                    </span>
                  </div>
                  
                  <div className="flex items-center bg-blue-50 rounded-full px-4 py-2">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <span className="text-blue-800 font-medium">
                      {courseData.enrolledStudents?.length || 0} {(courseData.enrolledStudents?.length || 0) !== 1 ? "Students" : "Student"}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                  <span>Course by <span className="text-blue-600 font-semibold hover:underline cursor-pointer">GreatStack</span></span>
                </div>
              </div>
      
              {/* Course Structure Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Course Structure
                </h2>
                
                <div className="space-y-3">
                  {courseData.courseContent?.map((chapter,index)=>(
                    <div className="border border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-xl overflow-hidden hover:shadow-md transition-all duration-300" key={index}>
                      <div className="flex items-center justify-between px-6 py-4 cursor-pointer select-none hover:bg-blue-50 transition-colors duration-200" onClick={() => toggleSection(index)}>
                        <div className="flex items-center gap-3">
                          <div className={`transform transition-transform duration-300 ${openSections[index] ? 'rotate-180' : ''} bg-blue-100 rounded-full p-2`}>
                            <img className="w-4 h-4" src={assets.down_arrow_icon} alt="arrow icon" />
                          </div>
                          <h3 className="font-semibold text-gray-800 text-base">{chapter.chapterTitle}</h3>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-blue-600">{chapter.chapterContent?.length || 0} lectures</p>
                          <p className="text-xs text-gray-500">{calculateChapterTime(chapter)}</p>
                        </div>
                      </div>

                      <div className={`overflow-hidden transition-all duration-500 ease-in-out ${openSections[index] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="bg-white border-t border-gray-100">
                          <ul className="divide-y divide-gray-50">
                            {chapter.chapterContent?.map((lecture,idx) =>(
                             <li key={idx} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors duration-200">
                                <div className="bg-green-100 rounded-full p-2">
                                  <img src={assets.play_icon} alt="play icon" className="w-4 h-4" />
                                </div>
                                <div className="flex items-center justify-between w-full">
                                  <p className="font-medium text-gray-700 flex-1">{lecture.lectureTitle}</p>
                                  <div className="flex items-center gap-3">
                                    {lecture.isPreviewFree && 
                                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full cursor-pointer hover:bg-green-200 transition-colors" onClick={()=>{
                                        setPlayerdata({videoId : lecture.lectureUrl.split('/').pop()})
                                      }}>
                                        Preview
                                      </span>
                                    }
                                    <span className="text-sm text-gray-500 font-medium">
                                      {humanizeDuration(lecture.lectureDuration * 60 * 1000,{units:['h','m']})}
                                    </span>
                                  </div>
                                </div>
                             </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Description Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Course Description
                </h3>
                <div className="prose prose-base prose-gray max-w-none">
                  <div className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: courseData.courseDescription}} />
                </div>
              </div>
            </div>

            {/* Right Column - Course Preview & Purchase */}
            <div className="lg:w-1/3 w-full">
              {/* Video/Thumbnail Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6 sticky top-6">
                <div className="relative">
                  {
                    playerdata ? 
                      <Youtube videoId={playerdata.videoId} opts={{playerVars : {autoplay : 1 }}} iframeClassName="w-full aspect-video"/>
                    :    <img src={courseData.courseThumbnail} alt="courseThumbnail" className="w-full aspect-video object-cover" />
                  }
                  
                  {/* Close Preview Button */}
                  {playerdata && (
                    <button 
                      onClick={() => setPlayerdata(null)}
                      className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
             
                <div className="p-6">
                  {/* Urgency Banner */}
                  <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <img className="w-4 h-4" src={assets.time_left_clock_icon} alt="time_left_clock_icon" />
                    <p className="text-red-600 text-sm font-medium">
                      <span className="font-bold">5 days</span> left at this price!
                    </p>
                  </div>

                  {/* Pricing Section */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="text-3xl font-bold text-gray-900">
                        {currency}{(courseData.coursePrice - courseData.discount * courseData.coursePrice/100).toFixed(2)}
                      </span>
                      <span className="text-lg text-gray-500 line-through">
                        {currency}{courseData.coursePrice}
                      </span>
                    </div>
                    <div className="inline-block bg-green-100 text-green-800 text-sm font-semibold px-3 py-1 rounded-full">
                      {courseData.discount}% OFF
                    </div>
                  </div>

                  {/* Course Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-xl">
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <img src={assets.star} alt="star icon" className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{calculateRating(courseData)}</p>
                      <p className="text-xs text-gray-500">Rating</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <img src={assets.time_clock_icon} alt="clock icon" className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{calculateCourseDuration(courseData)}</p>
                      <p className="text-xs text-gray-500">Duration</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-1">
                        <img src={assets.lesson_icon} alt="lesson icon" className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{calculateNoofLectures(courseData)}</p>
                      <p className="text-xs text-gray-500">Lessons</p>
                    </div>
                  </div>

                  {/* Enroll Button */}
                  <button 
                    onClick={enrollCourse}
                    disabled={isalreadyEnrolled}
                    className={`w-full py-4 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] mb-4 ${
                      isalreadyEnrolled 
                        ? 'bg-gray-400 cursor-not-allowed text-white' 
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
                    }`}
                  >
                    {isalreadyEnrolled ? 'Already Enrolled ✓' : 'Enroll Now'}
                  </button>
                  
                  {/* Money Back Guarantee */}
                  <div className="text-center mb-6">
                    <p className="text-sm text-gray-600">30-Day Money-Back Guarantee</p>
                  </div>
                  
                  {/* Course Includes */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      What's included
                    </h4>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">Lifetime access with free updates</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">Step-by-step, hands-on project guidance</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">Downloadable resources and source code</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">Interactive quizzes to test knowledge</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm text-gray-700">Certificate of completion</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </>
  ) : <Loading />;
};

export default CourseDetailes;