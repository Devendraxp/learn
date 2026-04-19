import React from "react";
import HeroLanding from '../../components/student/HeroLanding'
import Hero from '../../components/student/Hero'
import Companies from "../../components/student/Companies";
import CourseSection from "../../components/student/CourseSection";
import Testimonials from "../../components/student/Testimonials";
import CallToAction from "../../components/student/CallToAction";


const Home = () => {
  return (
    <div className='flex flex-col items-center space-y-7 text-center  bg-gray-100'>
      <HeroLanding/>
      <Hero/>
      <Companies/>
      <div data-section="courses">
        <CourseSection/>
      </div>
      <Testimonials/>
      <CallToAction/>
    </div>
  );
};

export default Home;
