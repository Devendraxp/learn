import React, { useState } from "react";
import { assets } from "../../assets/assets";
import { useNavigate } from "react-router-dom";

const Searchbar = ({data}) => {

  const [input,setInput] = useState(data ? data: "");
  const navigate = useNavigate( )

  const onSearchHandler = (e)=>{
    e.preventDefault()
    navigate('/course-list/'+ input);
  }

  return (
    <form onSubmit={onSearchHandler} className="flex items-center justify-center w-full max-w-xl mx-auto mt-8 bg-white rounded-full shadow px-4 py-2 gap-2" action="">
      <img src={assets.search_icon} alt="search_icon" className="w-6 h-6 md:w-7 md:h-7 ml-2" />
      {/* e.target.value  current searchbox value*/}
      <input onChange={e=>setInput(e.target.value)} value={input}
        type="text"
        placeholder="Search for Courses"
        className="flex-1 bg-transparent outline-none text-gray-600 px-4 py-2 text-base"
      />
      <button
        type="submit"
        className="bg-blue-600 rounded-full text-white px-6 py-2 font-semibold hover:bg-blue-700 transition-colors duration-200"
      >
        Search
      </button>
    </form>
  );
};

export default Searchbar;
