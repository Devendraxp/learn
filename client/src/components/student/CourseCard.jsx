import React, { useContext } from "react";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { Link } from "react-router-dom";

const CourseCard = ({ course }) => {
  const { currency } = useContext(AppContext);

  if (!course) return null;

    return (
      <Link 
        to={`/loading/course/${course._id}`} 
        onClick={(e) => {
          console.log('CourseCard clicked!');
          console.log('Course ID:', course._id);
          console.log('Target URL:', `/loading/course/${course._id}`);
          console.log('Event:', e);
          scrollTo(0,0);
        }}
        className="bg-white border border-gray-100 pb-6 overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group"
       >
          <div className="w-full h-48 overflow-hidden relative">
            <img 
              src={course.courseThumbnail || '/placeholder-course.jpg'} 
              alt={course.courseTitle || 'Course'} 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
            />
            <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md">
              {course.discount || 0}% OFF
            </span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <div className="p-5 text-left">
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                {course.courseCategory || 'Course'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {course.courseTitle}
            </h3>
            <p className="text-sm text-gray-500 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
              Educator: {course.educator?.name || 'Unknown Instructor'}
            </p>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center">
                <span className="text-amber-500 font-medium mr-1.5">4.5</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <img key={i} src={assets.star} alt="star" className="w-4 h-4" />
                  ))}
                </div>
              </div>
              <span className="text-gray-400 text-sm">({course.courseRatings?.length || 0} reviews)</span>
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
              <span className="text-gray-400 line-through text-sm">{currency}{(Number(course.coursePrice) || 0).toFixed(2)}</span>
              <span className="text-blue-600 font-bold text-lg">{currency}{(Number(course.coursePrice) - (Number(course.coursePrice) * (course.discount || 0) / 100)).toFixed(2)}</span>
              <div className="ml-auto">
                <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-medium group-hover:bg-blue-100 transition-colors">
                  View Course
                </span>
              </div>
            </div>
          </div>
      </Link>
    );
  
};

export default CourseCard;
