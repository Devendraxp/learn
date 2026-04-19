export const validateCourseForm = (formData) => {
  const errors = {};

  const plainDescription = formData.courseDescription
    ?.replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim() || "";

  if (!formData.courseTitle || formData.courseTitle.trim().length === 0) {
    errors.courseTitle = "Course title is required";
  } else if (formData.courseTitle.trim().length < 5) {
    errors.courseTitle = "Course title must be at least 5 characters long";
  } else if (formData.courseTitle.trim().length > 100) {
    errors.courseTitle = "Course title must not exceed 100 characters";
  }

  if (!plainDescription || plainDescription.length === 0) {
    errors.courseDescription = "Course description is required";
  } else if (plainDescription.length < 20) {
    errors.courseDescription = "Course description must be at least 20 characters long";
  } else if (plainDescription.length > 5000) {
    errors.courseDescription = "Course description must not exceed 5000 characters";
  }

  if (formData.coursePrice === undefined || formData.coursePrice === null) {
    errors.coursePrice = "Course price is required";
  } else if (isNaN(formData.coursePrice) || formData.coursePrice < 0) {
    errors.coursePrice = "Course price must be a valid positive number";
  } else if (formData.coursePrice > 10000) {
    errors.coursePrice = "Course price cannot exceed $10,000";
  }

  if (formData.discount === undefined || formData.discount === null) {
    errors.discount = "Discount is required (use 0 for no discount)";
  } else if (isNaN(formData.discount) || formData.discount < 0 || formData.discount > 100) {
    errors.discount = "Discount must be between 0 and 100 percent";
  }

  if (!formData.image) {
    errors.image = "Course thumbnail is required";
  } else if (formData.image.size > 5 * 1024 * 1024) {
    errors.image = "Thumbnail file size must not exceed 5MB";
  } else if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(formData.image.type)) {
    errors.image = "Thumbnail must be a valid image file (JPEG, JPG, PNG, or WebP)";
  }

  if (!formData.chapters || formData.chapters.length === 0) {
    errors.chapters = "At least one chapter is required";
  } else {
    formData.chapters.forEach((chapter, chapterIndex) => {
      const chapterErrors = {};

      if (!chapter.chapterTitle || chapter.chapterTitle.trim().length === 0) {
        chapterErrors.title = "Chapter title is required";
      } else if (chapter.chapterTitle.trim().length < 3) {
        chapterErrors.title = "Chapter title must be at least 3 characters";
      }

      if (!chapter.chapterContent || chapter.chapterContent.length === 0) {
        chapterErrors.content = "Each chapter must contain at least one lecture";
      } else {
        const lectureErrors = [];

        chapter.chapterContent.forEach((lecture, lectureIndex) => {
          const lectureError = {};

          if (!lecture.lectureTitle || lecture.lectureTitle.trim().length === 0) {
            lectureError.title = "Lecture title is required";
          } else if (lecture.lectureTitle.trim().length < 3) {
            lectureError.title = "Lecture title must be at least 3 characters";
          }

          const duration = Number(lecture.lectureDuration);
          if (!duration || isNaN(duration) || duration <= 0) {
            lectureError.duration = "Valid lecture duration is required";
          } else if (duration > 480) {
            lectureError.duration = "Lecture duration cannot exceed 480 minutes";
          }

          if (!lecture.lectureUrl || lecture.lectureUrl.trim().length === 0) {
            lectureError.url = "Lecture video URL is required";
          } else if (!isValidUrl(lecture.lectureUrl)) {
            lectureError.url = "Please provide a valid video URL";
          }

          if (Object.keys(lectureError).length > 0) {
            lectureErrors[lectureIndex] = lectureError;
          }
        });

        if (lectureErrors.length > 0) {
          chapterErrors.lectures = lectureErrors;
        }
      }

      if (Object.keys(chapterErrors).length > 0) {
        if (!errors.chapters) errors.chapters = {};
        errors.chapters[chapterIndex] = chapterErrors;
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch (_) {
    return false;
  }
};

export const validateLectureForm = (lectureData) => {
  const errors = {};

  if (!lectureData.lectureTitle || lectureData.lectureTitle.trim().length === 0) {
    errors.lectureTitle = "Lecture title is required";
  } else if (lectureData.lectureTitle.trim().length < 3) {
    errors.lectureTitle = "Lecture title must be at least 3 characters long";
  } else if (lectureData.lectureTitle.trim().length > 100) {
    errors.lectureTitle = "Lecture title must not exceed 100 characters";
  }

  const duration = Number(lectureData.lectureDuration);
  if (!duration || isNaN(duration) || duration <= 0) {
    errors.lectureDuration = "Valid lecture duration is required";
  } else if (duration > 480) {
    errors.lectureDuration = "Lecture duration cannot exceed 480 minutes";
  }

  if (!lectureData.lectureUrl || lectureData.lectureUrl.trim().length === 0) {
    errors.lectureUrl = "Lecture video URL is required";
  } else if (!isValidUrl(lectureData.lectureUrl)) {
    errors.lectureUrl = "Please provide a valid video URL";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export const sanitizeHtml = (html) => {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/g, "")
    .replace(/javascript:/gi, "");
};

export const validateApplyForm = (data = {}) => {
  const errors = {};

  const bio = (data.bio || '').replace(/<[^>]*>/g, '').trim();
  if (!bio || bio.length === 0) {
    errors.bio = 'Short bio is required';
  } else if (bio.length < 30) {
    errors.bio = 'Bio must be at least 30 characters';
  } else if (bio.length > 2000) {
    errors.bio = 'Bio must not exceed 2000 characters';
  }

  // certifications may be a single string or array
  const certs = data.certifications || [];
  if (typeof certs === 'string' && certs.trim().length > 0 && certs.trim().length < 2) {
    errors.certifications = 'Certifications field is too short';
  }
  if (Array.isArray(certs) && certs.some(c => typeof c === 'string' && c.trim().length > 500)) {
    errors.certifications = 'Each certification must be shorter than 500 characters';
  }

  // website and sampleCourseLink are optional but if provided must be valid URLs
  if (data.website && data.website.trim().length > 0 && !isValidUrl(String(data.website).trim())) {
    errors.website = 'Please provide a valid website URL';
  }

  if (data.sampleCourseLink && data.sampleCourseLink.trim().length > 0 && !isValidUrl(String(data.sampleCourseLink).trim())) {
    errors.sampleCourseLink = 'Please provide a valid sample course or video URL';
  }

  // require at least one portfolio item (website, sampleCourseLink, or certifications)
  const hasWebsite = data.website && String(data.website).trim().length > 0;
  const hasSample = data.sampleCourseLink && String(data.sampleCourseLink).trim().length > 0;
  const hasCert = (Array.isArray(certs) && certs.length > 0) || (typeof certs === 'string' && certs.trim().length > 0);
  if (!hasWebsite && !hasSample && !hasCert) {
    errors.missingPortfolio = 'Please provide at least one portfolio item (website, sample course link, or certifications)';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
