import React, { useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useContext } from "react";
import Searchbar from '../../components/student/Searchbar'
import { useParams } from "react-router-dom";
import CourseCard from "../../components/student/CourseCard";
import { assets } from "../../assets/assets";

const CourseList = () => {

   const {allcourses, navigate} = useContext(AppContext);
   const {input} = useParams();
   const [filteredcourses, setfilteredcourses] = useState([]);
   const [activeCategory, setActiveCategory] = useState('All');
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
    // Simulate loading for smooth transitions
    setIsLoading(true);
    
    setTimeout(() => {
      if(allcourses && allcourses.length > 0) {
        const tempCourses = allcourses.slice();
        
        let filtered = tempCourses;
        
        // Filter by search input if present
        if(input) {
          filtered = filtered.filter(
            item => item.courseTitle.toLowerCase().includes(input.toLowerCase())
          );
        }
        
        // Filter by category if not "All"
        if(activeCategory !== 'All') {
          filtered = filtered.filter(
            item => item.courseCategory === activeCategory || 
                   (item.category === activeCategory)
          );
        }
        
        setfilteredcourses(filtered);
        setIsLoading(false);
      }
    }, 300);
    
   }, [allcourses, input, activeCategory])

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section with Title and Breadcrumb */}
        <div className="bg-gradient-to-r from-blue-300 to-indigo-400 py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Course List</h1>
              <p className="text-white/80 flex items-center justify-center space-x-2 text-sm md:text-base"> 
                <span 
                  onClick={()=>navigate('/')} 
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Home
                </span> 
                <span className="px-2">/</span> 
                <span className="text-white font-medium">Course List</span>
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <Searchbar data={input}/>
            </div>
          </div>
        </div>
        
        {/* Search Results Display */}
        {input && (
          <div className="bg-white py-3 px-4 shadow-sm">
            <div className="container mx-auto max-w-7xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-medium mr-2">Search results for:</span>
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md">{input}</span>
                </div>
                <button 
                  onClick={() => navigate('/course-list')}
                  className="flex items-center text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <span className="mr-2">Clear search</span>
                  <img src={assets.cross_icon} alt="Clear" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Filter and Course Grid */}
        <div className="container mx-auto max-w-7xl px-4 py-12">
          {/* Course Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredcourses.map((course,index)=> <CourseCard key={index} course={course}/>)}
          </div>
          
          {/* Pagination */}
          <div className="mt-12 flex justify-center">
            <div className="flex items-center space-x-2">
              <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white">1</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors">2</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors">3</button>
              <span className="text-gray-500">...</span>
              <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors">8</button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
    </>
  );
};

export default CourseList;
