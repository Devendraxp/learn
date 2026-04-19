import React, { useContext,useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";

const MyCourses = () => {

  const {currency, getEducatorCourses, isEducator, deleteEducatorCourse} = useContext(AppContext);
    const [courses,setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEducatorCourses = async()=>{
        try {
            setLoading(true);
            setError(null);
            const educatorCourses = await getEducatorCourses();
            // Ensure each course has enrolledStudents array
            const coursesWithDefaults = educatorCourses.map(course => ({
                ...course,
                enrolledStudents: course.enrolledStudents || []
            }));
            setCourses(coursesWithDefaults);
        } catch (err) {
            console.error('Error fetching educator courses:', err);
            setError('Failed to load your courses');
            setCourses([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(()=>{
      if(isEducator){
        fetchEducatorCourses();
      }
    },[isEducator])

  return loading ? (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 flex items-center justify-center">
      <Loading />
    </div>
  ) : error ? (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg font-medium mb-2">Error Loading Courses</div>
          <div className="text-red-500 mb-4">{error}</div>
          <button 
            onClick={fetchEducatorCourses}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  ) : courses && courses.length > 0 ? (

    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-700 rounded-2xl p-6 lg:p-8 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">My Courses 📚</h1>
              <p className="text-purple-100 text-lg">Manage and track your course performance</p>
            </div>
          </div>
        </div>

        {/* Course Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{courses.length}</p>
                <p className="text-gray-600 text-sm">Total Courses</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{courses.reduce((total, course) => total + (course.enrolledStudents?.length || 0), 0)}</p>
                <p className="text-gray-600 text-sm">Total Students</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{currency}{courses.reduce((total, course) => total + Math.floor((course.enrolledStudents?.length || 0) * (course.coursePrice - (course.discount*course.coursePrice)/100)), 0)}</p>
                <p className="text-gray-600 text-sm">Total Earnings</p>
              </div>
            </div>
          </div>
        </div>
        {/* Courses Table */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">Course Performance</h2>
              </div>
              <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {courses.length} {courses.length === 1 ? 'Course' : 'Courses'}
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Course Details</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Earnings</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Students</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Published On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {courses.map((course)=>{
                   return (
                     <tr key={course._id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img 
                              src={course.courseThumbnail} 
                              alt="Course Thumbnail" 
                              className="w-16 h-12 object-cover rounded-lg border-2 border-gray-200 shadow-sm" 
                            />
                            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold">
                              ✓
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-900 truncate">{course.courseTitle}</p>
                            <p className="text-xs text-gray-500 mt-1">Course ID: {course._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td> 
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {currency}{Math.floor((course.enrolledStudents?.length || 0) * (course.coursePrice - (course.discount*course.coursePrice)/100))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {course.enrolledStudents?.length || 0}
                          </div>
                          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                          </svg>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={async () => {
                              if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
                              const ok = await deleteEducatorCourse(course._id);
                              if (ok) fetchEducatorCourses();
                            }}
                            className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 font-medium">
                          {new Date(course.createdAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </td> 
                    </tr>
                   )
                })}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>

  ) : (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
          <div className="text-gray-400 text-lg mb-4">No Courses Created Yet</div>
          <p className="text-gray-500 mb-6">Start by creating your first course to share your knowledge with students.</p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Create Your First Course
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
