import multer from "multer";
import path from "path";
import fs from "fs";

const syllabusDir = "uploads/syllabus";
if (!fs.existsSync(syllabusDir)) {
  fs.mkdirSync(syllabusDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, syllabusDir);
  },
  filename: (req, file, cb) => {
    const { assessmentId } = req.params;
    cb(null, `assessment_${assessmentId}.pdf`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files allowed"), false);
  }
};

export const uploadSyllabus = multer({
  storage,
  fileFilter,
});