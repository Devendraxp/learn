import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Loading = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    console.log("=== LOADING DEBUG ===");
    console.log("Current loading path:", currentPath);

    let destinationPath = null;

    // Process only valid loading routes
    if (currentPath.startsWith("/loading/")) {
      destinationPath = currentPath.replace("/loading", "");

      // Ensure it always starts with "/"
      if (!destinationPath.startsWith("/")) {
        destinationPath = "/" + destinationPath;
      }

      console.log("Extracted destination path:", destinationPath);
    } else {
      console.log("Not a loading route, no redirect will happen");
      return; // ❌ Prevent unwanted navigation
    }

    // Prevent redirecting to /loading or empty paths
    if (!destinationPath || destinationPath === "/loading" || destinationPath === "/loading/") {
      console.log("Invalid destination, redirecting home");
      destinationPath = "/";
    }

    const timer = setTimeout(() => {
      console.log("Navigating to:", destinationPath);
      try {
        navigate(destinationPath, { replace: true });
      } catch (err) {
        console.error("Navigation error:", err);
        navigate("/", { replace: true });
      }
    }, 700);

    return () => clearTimeout(timer);
  }, []); // ❗ run only once – prevents infinite redirects

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center z-50">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <div
            className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto absolute top-2 left-1/2 transform -translate-x-1/2"
            style={{ animation: "spin 1.5s linear infinite reverse" }}
          ></div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-700 mb-2 animate-pulse">
            Loading Course
          </h2>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>

        <div className="w-64 bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center justify-center space-x-2 animate-pulse">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
            <span>Fetching course data...</span>
          </div>
          <div
            className="flex items-center justify-center space-x-2 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          >
            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
            <span>Loading content...</span>
          </div>
          <div
            className="flex items-center justify-center space-x-2 animate-pulse"
            style={{ animationDelay: "1s" }}
          >
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
            <span>Preparing interface...</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
