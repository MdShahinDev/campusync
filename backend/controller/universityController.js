const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");
const University = require("../model/University");
const Course = require("../model/Course");

const normalizeUniversityName = (name) => name.trim().toLowerCase();
const normalizeCourseCode = (code) => code.trim().toLowerCase();

exports.createUniversity = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { university, courses } = req.body;

    if (!university || !university.trim()) {
      return res.status(400).json({
        success: false,
        message: "University name is required",
      });
    }

    if (!courses || !Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one course is required",
      });
    }

    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      if (!course.courseCode || !course.courseCode.trim()) {
        return res.status(400).json({
          success: false,
          message: `Course code is required for course ${i + 1}`,
        });
      }
      if (!course.courseTitle || !course.courseTitle.trim()) {
        return res.status(400).json({
          success: false,
          message: `Course title is required for course ${i + 1}`,
        });
      }
    }

    const normalizedName = normalizeUniversityName(university);
    const universityName = university.trim();

    let universityDoc = await University.findOne({ normalizedName }).session(session);

    let universityCreated = false;
    if (!universityDoc) {
      const [newUni] = await University.create(
        [{ name: universityName, normalizedName }],
        { session }
      );
      universityDoc = newUni;
      universityCreated = true;
    }

    let coursesCreated = 0;
    let duplicatesSkipped = 0;
    const duplicateCourses = [];

    const normalizedCodes = courses.map((c) => normalizeCourseCode(c.courseCode));
    const existingCourses = await Course.find({
      universityId: universityDoc._id,
      normalizedCourseCode: { $in: normalizedCodes },
    }).session(session);

    const existingCodeSet = new Set(
      existingCourses.map((c) => c.normalizedCourseCode)
    );

    const newCourses = [];
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      const normalizedCode = normalizedCodes[i];

      if (existingCodeSet.has(normalizedCode)) {
        duplicatesSkipped++;
        duplicateCourses.push({
          courseCode: course.courseCode.trim(),
          courseTitle: course.courseTitle.trim(),
        });
      } else {
        existingCodeSet.add(normalizedCode);
        newCourses.push({
          universityId: universityDoc._id,
          courseCode: course.courseCode.trim(),
          courseTitle: course.courseTitle.trim(),
          normalizedCourseCode: normalizedCode,
        });
      }
    }

    if (newCourses.length > 0) {
      const inserted = await Course.insertMany(newCourses, { session });
      coursesCreated = inserted.length;
    }

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      message: "University and courses saved successfully",
      data: {
        university: universityDoc,
        universityCreated,
        coursesCreated,
        duplicatesSkipped,
        duplicateCourses,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Create university error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  } finally {
    session.endSession();
  }
};

exports.importCSV = async (req, res) => {
  const filePath = req.file?.path;

  try {
    if (!filePath) {
      return res.status(400).json({
        success: false,
        message: "No CSV file uploaded",
      });
    }

    const ext = require("path").extname(req.file.originalname).toLowerCase();
    if (ext !== ".csv") {
      return res.status(400).json({
        success: false,
        message: "Only CSV files are allowed",
      });
    }

    const rows = [];
    const errors = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(
          csv({
            mapHeaders: ({ header }) => header.trim(),
          })
        )
        .on("data", (row) => {
          rows.push(row);
        })
        .on("error", (err) => {
          reject(err);
        })
        .on("end", () => {
          resolve();
        });
    });

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "CSV file is empty",
      });
    }

    const requiredColumns = ["University", "Course Code", "Course Title"];
    const headers = Object.keys(rows[0]);
    const missingColumns = requiredColumns.filter((col) => !headers.includes(col));

    if (missingColumns.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required columns: ${missingColumns.join(", ")}`,
      });
    }

    const validRows = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;
      const university = row["University"]?.trim();
      const courseCode = row["Course Code"]?.trim();
      const courseTitle = row["Course Title"]?.trim();

      if (!university) {
        errors.push({ row: rowNum, reason: "University is missing" });
        continue;
      }
      if (!courseCode) {
        errors.push({ row: rowNum, reason: "Course Code is missing" });
        continue;
      }
      if (!courseTitle) {
        errors.push({ row: rowNum, reason: "Course Title is missing" });
        continue;
      }

      validRows.push({ university, courseCode, courseTitle });
    }

    const universityNameMap = new Map();
    for (const row of validRows) {
      const normalized = normalizeUniversityName(row.university);
      if (!universityNameMap.has(normalized)) {
        universityNameMap.set(normalized, row.university);
      }
    }

    const normalizedNames = [...universityNameMap.keys()];
    const existingUniversities = await University.find({
      normalizedName: { $in: normalizedNames },
    });

    const universityIdMap = new Map();
    for (const uni of existingUniversities) {
      universityIdMap.set(uni.normalizedName, uni._id);
    }

    const newUniversities = [];
    for (const [normalizedName, originalName] of universityNameMap) {
      if (!universityIdMap.has(normalizedName)) {
        newUniversities.push({ name: originalName, normalizedName });
      }
    }

    let universitiesCreated = 0;
    if (newUniversities.length > 0) {
      const insertedUnis = await University.insertMany(newUniversities);
      universitiesCreated = insertedUnis.length;
      for (const uni of insertedUnis) {
        universityIdMap.set(uni.normalizedName, uni._id);
      }
    }

    const courseDocs = [];
    for (const row of validRows) {
      const normalizedUni = normalizeUniversityName(row.university);
      const universityId = universityIdMap.get(normalizedUni);
      courseDocs.push({
        universityId,
        courseCode: row.courseCode,
        courseTitle: row.courseTitle,
        normalizedCourseCode: normalizeCourseCode(row.courseCode),
      });
    }

    let coursesCreated = 0;
    let duplicatesSkipped = 0;

    if (courseDocs.length > 0) {
      const bulkOps = courseDocs.map((doc) => ({
        updateOne: {
          filter: {
            universityId: doc.universityId,
            normalizedCourseCode: doc.normalizedCourseCode,
          },
          update: {
            $setOnInsert: {
              universityId: doc.universityId,
              courseCode: doc.courseCode,
              courseTitle: doc.courseTitle,
              normalizedCourseCode: doc.normalizedCourseCode,
            },
          },
          upsert: true,
        },
      }));

      const result = await Course.bulkWrite(bulkOps, { ordered: false });
      coursesCreated = result.upsertedCount;
      duplicatesSkipped = courseDocs.length - result.upsertedCount;
    }

    return res.status(200).json({
      success: true,
      message: "Import completed",
      data: {
        totalRows: rows.length,
        validRows: validRows.length,
        universitiesCreated,
        coursesCreated,
        duplicatesSkipped,
        failedRows: errors.length,
        errors,
      },
    });
  } catch (error) {
    console.error("CSV import error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

exports.getAllUniversities = async (req, res) => {
  try {
    const universities = await University.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      data: { universities },
    });
  } catch (error) {
    console.error("Get universities error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getUniversitiesWithCourses = async (req, res) => {
  try {
    const universities = await University.find().sort({ name: 1 });
    const universityIds = universities.map((u) => u._id);

    const courses = await Course.find({
      universityId: { $in: universityIds },
    }).sort({ courseCode: 1 });

    const courseMap = new Map();
    for (const course of courses) {
      const uid = course.universityId.toString();
      if (!courseMap.has(uid)) courseMap.set(uid, []);
      courseMap.get(uid).push(course);
    }

    const result = universities.map((uni) => ({
      ...uni.toObject(),
      courses: courseMap.get(uni._id.toString()) || [],
    }));

    res.status(200).json({
      success: true,
      data: { universities: result },
    });
  } catch (error) {
    console.error("Get universities with courses error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getCoursesByUniversity = async (req, res) => {
  try {
    const { universityId } = req.params;
    const courses = await Course.find({ universityId }).sort({ courseCode: 1 });
    res.status(200).json({
      success: true,
      data: { courses },
    });
  } catch (error) {
    console.error("Get courses error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.deleteUniversity = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { universityId } = req.params;

    const university = await University.findById(universityId).session(session);
    if (!university) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "University not found",
      });
    }

    const deleteResult = await Course.deleteMany({ universityId }).session(session);
    await University.findByIdAndDelete(universityId).session(session);

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `University "${university.name}" and ${deleteResult.deletedCount} course(s) deleted successfully`,
      data: {
        university: { _id: university._id, name: university.name },
        coursesDeleted: deleteResult.deletedCount,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Delete university error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  } finally {
    session.endSession();
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    await Course.findByIdAndDelete(courseId);

    res.status(200).json({
      success: true,
      message: `Course "${course.courseCode}" deleted successfully`,
      data: {
        course: {
          _id: course._id,
          courseCode: course.courseCode,
          courseTitle: course.courseTitle,
          universityId: course.universityId,
        },
      },
    });
  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.bulkDeleteCourses = async (req, res) => {
  try {
    const { courseIds } = req.body;

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "courseIds array is required and must not be empty",
      });
    }

    const objectIds = courseIds.map((id) => {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error(`Invalid course ID: ${id}`);
      }
      return new mongoose.Types.ObjectId(id);
    });

    const result = await Course.deleteMany({ _id: { $in: objectIds } });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} course(s) deleted successfully`,
      data: { deletedCount: result.deletedCount },
    });
  } catch (error) {
    console.error("Bulk delete courses error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};
