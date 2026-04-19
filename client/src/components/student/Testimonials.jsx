import React from "react";
import { dummyTestimonial ,assets} from "../../assets/assets";

const Testimonials = () => {
  return (
    <div className="pb-14 px-8 md:px-0">
      <h2 className="text-3xl font-medium text-gray-800">Testimonials</h2>
      <p className="md:text-base text-gray-500 mt-3">Hear from our learners as they share their journeys of th transformation ,
        success , and how our <br /> platform has made a difference in their lives.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-14 mx-auto max-w-7xl">
        {dummyTestimonial.map((testimonial, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-xl bg-white shadow-lg overflow-hidden min-h-[220px] flex flex-col"
          >
            <div className="flex flex-col items-center justify-center bg-gray-100 px-4 pt-5 pb-3 rounded-t-xl">
              <img className="h-12 w-12 rounded-full mb-2 border border-blue-100" src={testimonial.image} alt="testimonial" />
              <h1 className="text-base font-semibold text-gray-800 text-center">{testimonial.name}</h1>
              <p className="text-gray-500 text-xs text-center">{testimonial.role}</p>
            </div>
            <div className="px-4 py-4 flex-1 flex flex-col justify-between">
              <p className="text-gray-600 text-sm text-center">{testimonial.feedback}</p>
              <div className="flex items-center justify-center gap-1 mt-4">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <img
                      key={i}
                      src={i < Math.floor(testimonial.rating) ? assets.star : assets.star_blank}
                      alt="star"
                      className="w-4 h-4"
                    />
                  ))}
                </div>
                <span className="text-yellow-600 font-bold text-xs">{testimonial.rating}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;
