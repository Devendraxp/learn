import React from "react";
import { assets } from "../../assets/assets";

const CallToAction = () => {
  return (
    <section className="w-full flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-100 rounded-2xl shadow-md mt-10">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 text-center">Start building your future today</h1>
      <p className="text-gray-500 text-base md:text-lg max-w-xl text-center mb-8">
        Join thousands of learners who have transformed their careers with expert-led courses, real-world projects, and a community that supports your growth every step of the way.
      </p>
      <div className="flex gap-4">
        <button className="bg-blue-600 text-white px-8 py-3 rounded-full font-semibold shadow hover:bg-blue-700 transition-colors duration-200">Get Started</button>
        <button className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-full font-semibold flex items-center gap-2 shadow hover:bg-blue-50 transition-colors duration-200">
          Learn More
          <img src={assets.arrow_icon} alt="arrow" className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};

export default CallToAction;
