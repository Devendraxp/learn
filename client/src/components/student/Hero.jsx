import React from "react";
import { assets } from "../../assets/assets";
import Searchbar from "./Searchbar";

const Hero = () => {
  return (
    <section className="flex flex-col items-center justify-center w-full min-h-[60vh] pt-20 md:pt-36 px-7 md:px-0 text-center bg-gradient-to-b from-cyan-100/70 to-gray-100">
      <div className="relative max-w-3xl mx-auto w-full flex flex-col items-center">
        <h1 className="font-bold text-gray-800 w-full md:text-[2.3rem] text-[1.3rem] leading-tight text-center">
          Empower your future with the<br />
          courses designed to
          <span className="text-blue-600 inline-block relative ml-2 md:text-[2.3rem] text-[1.3rem] font-extrabold">
            fit your choice.
          </span>
        </h1>
        <img src={assets.sketch} alt="sketch underline" className="absolute left-[60%] bottom-[-10px] w-[40%] md:w-[35%] pointer-events-none select-none -z-10" />
      </div>
      <p className="mt-6 text-gray-500 max-w-2xl mx-auto md:block hidden">
        We bring together world-class instructors, interactive content, and a supportive community to help you achieve your personal and professional goals.
      </p>
      <p className="mt-6 text-gray-500 max-w-sm mx-auto md:hidden">
        We bring together world-class instructors, interactive content, and a supportive community to help you achieve your personal and professional goals.
      </p>

      <Searchbar />
    </section>
  );
};

export default Hero;
