import React, { useEffect, useRef, useContext } from "react";
import { assets } from "../../assets/assets";
import uniqid from "uniqid";
import { useState } from "react";
import Quill from "quill";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import {
  validateCourseForm,
  validateLectureForm,
  sanitizeHtml,
} from "../../utils/validation";

const Addcourse = () => {
  const quillRef = useRef(null);
  const editorRef = useRef(null);
  const { backendurl, getToken } = useContext(AppContext);

  const [courseTitle, setCourseTitle] = useState("");
  const [coursePrice, setCoursePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [image, setImage] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [showpopup, setShowPopup] = useState(false);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: "",
    lectureDuration: "",
    lectureUrl: "",
    isPreviewFree: false,
  });
  const [formErrors, setFormErrors] = useState({});
  const [lectureErrors, setLectureErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add / remove / toggle chapter
  const handleChapter = (action, chapterIndex, chapterId) => {
    if (action === "add") {
      const title = prompt("Enter Chapter Name:");
      if (title && title.trim().length > 0) {
        const newChapter = {
          chapterId: uniqid(),
          chapterTitle: title.trim(),
          chapterContent: [],
          collapsed: false,
          chapterOrder: chapters.length > 0 ? chapters[chapters.length - 1].chapterOrder + 1 : 1,
        };
        setChapters((prev) => [...prev, newChapter]);
      }
    } else if (action === "remove") {
      setChapters((prev) => prev.filter((c) => c.chapterId !== chapterId));
    } else if (action === "toggle") {
      setChapters((prev) =>
        prev.map((chapter) =>
          chapter.chapterId === chapterId ? { ...chapter, collapsed: !chapter.collapsed } : chapter
        )
      );
    }
  };

  // Add / remove lecture
  const handleLecture = (action, chapterId, lectureIndex) => {
    if (action === "add") {
      setCurrentChapterId(chapterId);
      setLectureErrors({});
      setShowPopup(true);
    } else if (action === "remove") {
      setChapters((prev) =>
        prev.map((chapter) =>
          chapter.chapterId === chapterId
            ? { ...chapter, chapterContent: chapter.chapterContent.filter((_, i) => i !== lectureIndex) }
            : chapter
        )
      );
    }
  };

  // Add lecture with validation
  const addLectures = () => {
    // normalize lectureDetails for validation
    const lecturePayload = {
      ...lectureDetails,
      lectureDuration: Number(lectureDetails.lectureDuration),
    };

    const validation = validateLectureForm(lecturePayload);
    if (!validation.isValid) {
      setLectureErrors(validation.errors);
      return;
    }

    setLectureErrors({});

    // determine max lectureId safely
    let maxLectureId = 0;
    chapters.forEach((ch) => {
      ch.chapterContent.forEach((lec) => {
        if (typeof lec.lectureId === "number" && lec.lectureId > maxLectureId) maxLectureId = lec.lectureId;
      });
    });

    setChapters((prev) =>
      prev.map((chapter) => {
        if (chapter.chapterId === currentChapterId) {
          const newLecture = {
            lectureTitle: lectureDetails.lectureTitle.trim(),
            lectureDuration: Number(lectureDetails.lectureDuration),
            lectureUrl: lectureDetails.lectureUrl.trim(),
            isPreviewFree: lectureDetails.isPreviewFree,
            lectureOrder: chapter.chapterContent.length + 1,
            lectureId: maxLectureId + 1,
          };
          return { ...chapter, chapterContent: [...chapter.chapterContent, newLecture] };
        }
        return chapter;
      })
    );

    setLectureDetails({
      lectureTitle: "",
      lectureDuration: "",
      lectureUrl: "",
      isPreviewFree: false,
    });

    toast.success("Lecture added successfully!");
    setShowPopup(false);
  };

  // Submit course handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    try {
      const descHTML = quillRef.current?.root?.innerHTML ?? "";
      const descPlain = quillRef.current?.root?.innerText ?? "";

      const formDataForValidation = {
        courseTitle,
        courseDescription: descHTML,
        plainDescription: descPlain,
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        image,
        chapters,
      };

      const validation = validateCourseForm(formDataForValidation);
      if (!validation.isValid) {
        setFormErrors(validation.errors);
        toast.error("Please fix the validation errors before submitting.");
        setIsSubmitting(false);
        return;
      }

      const courseData = {
        courseTitle: courseTitle.trim(),
        courseDescription: sanitizeHtml(descHTML),
        coursePrice: Number(coursePrice),
        discount: Number(discount),
        courseContent: chapters,
        isPublished: true,
        courseRatings: [],
        enrolledStudents: [],
      };

      const formData = new FormData();
      formData.append("courseData", JSON.stringify(courseData));
      formData.append("image", image);

      const token = await getToken();
      const { data } = await axios.post(backendurl + "/api/educator/add-course", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success(data.message || "Course created successfully!");
        setCourseTitle("");
        setCoursePrice(0);
        setDiscount(0);
        setImage(null);
        setChapters([]);
        setFormErrors({});
        if (quillRef.current?.root) quillRef.current.root.innerHTML = "";
      } else {
        toast.error(data.message || "Failed to create course");
      }
    } catch (error) {
      console.error("Error creating course:", error);
      if (error.response) {
        toast.error(error.response.data?.message || `Server Error: ${error.response.status}`);
      } else if (error.request) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error(error.message || "Failed to create course");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, { theme: "snow" });
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-white to-purple-50/20 p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 lg:p-8 text-white shadow-lg">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Create New Course ✏️</h1>
              <p className="text-indigo-100 text-lg">Build engaging content for your students</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800">Course Information</h2>
            <p className="text-gray-600 text-sm mt-1">Fill in the basic details about your course</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-8">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                Course Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                onChange={(e) => setCourseTitle(e.target.value)}
                value={courseTitle}
                placeholder="Enter an engaging course title..."
                className="w-full outline-none py-3 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                Course Description <span className="text-red-500">*</span>
              </label>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div ref={editorRef} className="min-h-[120px]"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  Course Price <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    onChange={(e) => setCoursePrice(Number(e.target.value))}
                    value={coursePrice}
                    placeholder="99"
                    className="w-full outline-none py-3 pl-8 pr-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                  Discount Percentage
                </label>
                <div className="relative">
                  <input
                    type="number"
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    value={discount}
                    placeholder="10"
                    className="w-full outline-none py-3 px-4 pr-8 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                    max="100"
                    min="0"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">%</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                Course Thumbnail <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400">
                <label htmlFor="thumbnailImage" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-4">
                    {image ? (
                      <div className="relative">
                        <img className="w-32 h-20 object-cover rounded-lg border-2 border-gray-200" src={URL.createObjectURL(image)} alt="Course thumbnail preview" />
                      </div>
                    ) : (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <img src={assets.file_upload_icon} alt="Upload" className="w-8 h-8" />
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-700">{image ? "Click to change thumbnail" : "Click to upload thumbnail"}</p>
                      <p className="text-xs text-gray-500 mt-1">Recommended: 16:9 aspect ratio, max 2MB</p>
                    </div>
                  </div>
                  <input type="file" id="thumbnailImage" onChange={(e) => setImage(e.target.files[0])} accept="image/*" hidden />
                </label>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mt-8">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Course Content</h2>
                    <p className="text-gray-600 text-sm mt-1">Organize your course into chapters and lectures</p>
                  </div>
                  <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {chapters.length} {chapters.length === 1 ? "Chapter" : "Chapters"}
                  </div>
                </div>
              </div>

              <div className="p-6 lg:p-8 space-y-6">
                <div className="space-y-4">
                  {chapters.map((chapter, chapterIndex) => (
                    <div key={chapter.chapterId || chapterIndex} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-md">
                      <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <button type="button" onClick={() => handleChapter("toggle", chapterIndex, chapter.chapterId)} className="p-2 hover:bg-gray-100 rounded-lg">
                            <img src={assets.dropdown_icon} className={`w-4 h-4 transition-transform duration-200 ${chapter.collapsed && "-rotate-90"}`} alt="Toggle chapter" />
                          </button>
                          <div className="flex items-center gap-2">
                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{chapterIndex + 1}</span>
                            <span className="font-semibold text-gray-800">{chapter.chapterTitle}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {chapter.chapterContent.length} {chapter.chapterContent.length === 1 ? "Lecture" : "Lectures"}
                          </span>
                          <button type="button" onClick={() => handleChapter("remove", chapterIndex, chapter.chapterId)} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg">
                            <img src={assets.cross_icon} className="w-4 h-4" alt="Remove chapter" />
                          </button>
                        </div>
                      </div>

                      {!chapter.collapsed && (
                        <div className="p-4 space-y-3">
                          {chapter.chapterContent.map((lecture, lectureIndex) => (
                            <div key={lecture.lectureId ?? lectureIndex} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-100 hover:border-blue-200">
                              <div className="flex items-center gap-3">
                                <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded">{lectureIndex + 1}</span>
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                                  <span className="font-medium text-gray-800">{lecture.lectureTitle}</span>
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">{lecture.lectureDuration} mins</span>
                                    <a href={lecture.lectureUrl} className="text-blue-500 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">View Link</a>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${lecture.isPreviewFree ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{lecture.isPreviewFree ? "Free Preview" : "Premium"}</span>
                                  </div>
                                </div>
                              </div>
                              <button type="button" onClick={() => handleLecture("remove", chapter.chapterId, lectureIndex)} className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg">
                                <img src={assets.cross_icon} className="w-4 h-4" alt="Remove lecture" />
                              </button>
                            </div>
                          ))}

                          <button type="button" className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-4 py-2 rounded-lg" onClick={() => handleLecture("add", chapter.chapterId)}>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"/></svg>
                            Add Lecture
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-center pt-4">
                  <button type="button" className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold px-6 py-3 rounded-xl" onClick={() => handleChapter("add")}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"/></svg>
                    Add New Chapter
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-8">
              <button type="submit" className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-12 rounded-xl text-lg">
                🚀 Create Course
              </button>
            </div>
          </form>
        </div>
      </div>

      {showpopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
          <div className="bg-white text-gray-700 rounded-2xl shadow-2xl w-full max-w-md relative transform transition-all duration-300">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-800">Add New Lecture</h2>
              <button type="button" onClick={() => setShowPopup(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <img src={assets.cross_icon} alt="Close" className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Lecture Title <span className="text-red-500">*</span></label>
                <input type="text" className="w-full border border-gray-300 rounded-lg py-3 px-4" placeholder="Enter lecture title..." value={lectureDetails.lectureTitle} onChange={(e) => setLectureDetails((p) => ({ ...p, lectureTitle: e.target.value }))} />
                {lectureErrors.lectureTitle && <p className="text-xs text-red-500 mt-1">{lectureErrors.lectureTitle}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (minutes) <span className="text-red-500">*</span></label>
                <input type="number" min="1" className="w-full border border-gray-300 rounded-lg py-3 px-4" placeholder="e.g., 45" value={lectureDetails.lectureDuration} onChange={(e) => setLectureDetails((p) => ({ ...p, lectureDuration: e.target.value }))} />
                {lectureErrors.lectureDuration && <p className="text-xs text-red-500 mt-1">{lectureErrors.lectureDuration}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Lecture URL <span className="text-red-500">*</span></label>
                <input type="url" className="w-full border border-gray-300 rounded-lg py-3 px-4" placeholder="https://youtube.com/watch?v=..." value={lectureDetails.lectureUrl} onChange={(e) => setLectureDetails((p) => ({ ...p, lectureUrl: e.target.value }))} />
                {lectureErrors.lectureUrl && <p className="text-xs text-red-500 mt-1">{lectureErrors.lectureUrl}</p>}
              </div>

              <div className="flex items-center space-x-3">
                <input id="isPreviewFree" type="checkbox" className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded" checked={lectureDetails.isPreviewFree} onChange={(e) => setLectureDetails((p) => ({ ...p, isPreviewFree: e.target.checked }))} />
                <label htmlFor="isPreviewFree" className="text-sm font-medium text-gray-700 cursor-pointer">Make this lecture free to preview</label>
              </div>
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <button type="button" onClick={() => setShowPopup(false)} className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg">Cancel</button>
              <button type="button" onClick={addLectures} className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg">Add Lecture</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Addcourse;
