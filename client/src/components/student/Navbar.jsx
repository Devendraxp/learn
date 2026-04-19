import React, { useContext } from "react";
import { assets, dummyEducatorData } from '../../assets/assets'
import { Link, useLocation } from "react-router-dom";   // ✅ IMPORT useLocation
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { AppContext } from "../../context/AppContext";
import axios from 'axios';
import { toast } from 'react-toastify';

const Navbar = () => {

  const location = useLocation();           // ✅ Always use router location
  const educatorData = dummyEducatorData;

  const isCourseListPage = location.pathname.includes('course-list');   // ✅ FIXED

  const { openSignIn } = useClerk();
  const { user } = useUser();
  const { navigate, isEducator, setIsEducator, backendurl, getToken } = useContext(AppContext);

  const becomeEducator = async () => {
    // Redirect users to the educator application page instead of auto-promoting.
    if (isEducator || user?.publicMetadata?.role === 'educator') {
      navigate('/educator');
      return;
    }
    navigate('/educator/apply');
  };

  return (
    <div className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 
      ${isCourseListPage ? 'bg-white' : 'bg-cyan-100/70'}`}>

      <img 
        onClick={() => navigate('/')} 
        src={assets.logo} 
        alt="Logo" 
        className="w-28 lg:w-32 cursor-pointer" 
      />

      <div className="hidden md:flex items-center gap-5 text-gray-500">
        <div className="flex items-center gap-5">
          {user && (
            <>
              <button className="cursor-pointer" onClick={becomeEducator}>
                {isEducator ? 'Educator Dashboard' : 'Become Educator'}
              </button>
              | <Link to="/myenrollments"> My-Enrollments </Link>
            </>
          )}
        </div>

        {user ? (
          <UserButton />
        ) : (
          <button onClick={() => openSignIn()} className="bg-blue-600 text-white px-5 py-2 rounded-full">
            Create Account
          </button>
        )}
      </div>

      {/* Mobile navbar */}
      <div className="md:hidden flex items-center gap-2 sm:gap-5 text-gray-500">
        <div>
          {user && (
            <>
              <button onClick={becomeEducator}>Become Educator</button>
              | <Link to="/myenrollments"> My-Enrollments </Link>
            </>
          )}
        </div>
        <div>
          {user ? (
            <UserButton />
          ) : (
            <button onClick={() => openSignIn()}>
              <img src={assets.user_icon} alt="" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
