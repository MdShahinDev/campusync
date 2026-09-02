const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");
const { del } = require("@vercel/blob");

const University = require("../model/University");
const Course = require("../model/Course");
const Resource = require("../model/Resource");

const normalizeUniversityName = (name) => name.trim().toLowerCase();
const normalizeCourseCode = (code) => code.trim().toLowerCase();

const deleteResourcesByFilter = async (filter, session) => {
  const resources = await Resource.find(filter).session(session);
  for (const resource of resources) {
    if (resource.file_url) {
      try {
        await del(resource.file_url);
      } catch (e) {
        console.error("Blob delete error:", e.message);
      }
    }
  }
  const result = await Resource.deleteMany(filter).session(session);
  return result.deletedCount;
};

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
    // ============================================
    // 1. Check uploaded file
    // ============================================

    if (!req.file || !filePath) {
      return res.status(400).json({
        success: false,
        message: "No CSV file uploaded",
      });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();

    if (ext !== ".csv") {
      return res.status(400).json({
        success: false,
        message: "Only CSV files are allowed",
      });
    }

    // ============================================
    // 2. Read and parse CSV
    // ============================================

    const rows = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(
          csv({
            // Remove spaces from column names
            // and remove UTF-8 BOM if Excel added it.
            mapHeaders: ({ header }) =>
              header
                .replace(/^\uFEFF/, "")
                .trim(),
          })
        )
        .on("data", (row) => {
          rows.push(row);
        })
        .on("error", reject)
        .on("end", resolve);
    });

    // ============================================
    // 3. Check empty CSV
    // ============================================

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "CSV file is empty",
      });
    }

    // ============================================
    // 4. Validate CSV headers
    // ============================================

    const requiredColumns = [
      "University",
      "Course Code",
      "Course Title",
    ];

    const headers = Object.keys(rows[0]);

    const missingColumns = requiredColumns.filter(
      (column) => !headers.includes(column)
    );

    if (missingColumns.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required columns: ${missingColumns.join(", ")}`,
        requiredColumns,
      });
    }

    // ============================================
    // 5. Validate rows
    // ============================================

    const validRows = [];
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // CSV header is row 1
      // Therefore first data row = row 2
      const rowNumber = i + 2;

      const university = String(
        row["University"] || ""
      ).trim();

      const courseCode = String(
        row["Course Code"] || ""
      ).trim();

      const courseTitle = String(
        row["Course Title"] || ""
      ).trim();

      // University validation
      if (!university) {
        errors.push({
          row: rowNumber,
          reason: "University is missing",
        });

        continue;
      }

      // Course code validation
      if (!courseCode) {
        errors.push({
          row: rowNumber,
          reason: "Course Code is missing",
        });

        continue;
      }

      // Course title validation
      if (!courseTitle) {
        errors.push({
          row: rowNumber,
          reason: "Course Title is missing",
        });

        continue;
      }

      validRows.push({
        rowNumber,
        university,
        courseCode,
        courseTitle,
      });
    }

    // ============================================
    // 6. Stop if no valid rows
    // ============================================

    if (validRows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid rows found in CSV",
        totalRows: rows.length,
        failedRows: errors.length,
        errors,
      });
    }

    // ============================================
    // 7. Remove duplicate courses INSIDE CSV
    // ============================================

    /*
      Example:

      University A | CSE101 | Computer Science
      University A | CSE101 | Computer Science

      Only one should be inserted.
    */

    const uniqueCourseMap = new Map();

    let duplicatesInsideCSV = 0;

    for (const row of validRows) {
      const normalizedUniversity =
        normalizeUniversityName(row.university);

      const normalizedCourseCode =
        normalizeCourseCode(row.courseCode);

      const uniqueKey =
        `${normalizedUniversity}::${normalizedCourseCode}`;

      if (uniqueCourseMap.has(uniqueKey)) {
        duplicatesInsideCSV++;

        errors.push({
          row: row.rowNumber,
          reason: `Duplicate course in CSV: ${row.courseCode} for ${row.university}`,
        });

        continue;
      }

      uniqueCourseMap.set(uniqueKey, row);
    }

    const uniqueRows = Array.from(
      uniqueCourseMap.values()
    );

    // ============================================
    // 8. Get unique universities from CSV
    // ============================================

    const universityMap = new Map();

    for (const row of uniqueRows) {
      const normalizedName =
        normalizeUniversityName(row.university);

      if (!universityMap.has(normalizedName)) {
        universityMap.set(
          normalizedName,
          row.university
        );
      }
    }

    const normalizedUniversityNames =
      Array.from(universityMap.keys());

    // ============================================
    // 9. Find existing universities
    // ============================================

    const existingUniversities =
      await University.find({
        normalizedName: {
          $in: normalizedUniversityNames,
        },
      }).lean();

    const universityIdMap = new Map();

    for (const university of existingUniversities) {
      universityIdMap.set(
        university.normalizedName,
        university._id
      );
    }

    const universitiesBeforeImport =
      universityIdMap.size;

    // ============================================
    // 10. Create missing universities
    // ============================================

    const universitiesToCreate = [];

    for (const [
      normalizedName,
      originalName,
    ] of universityMap.entries()) {
      if (!universityIdMap.has(normalizedName)) {
        universitiesToCreate.push({
          name: originalName.trim(),
          normalizedName,
        });
      }
    }

    let universitiesCreated = 0;

    if (universitiesToCreate.length > 0) {
      /*
        Use bulkWrite + upsert instead of insertMany.

        This protects against two simultaneous imports
        trying to create the same university.
      */

      const universityOperations =
        universitiesToCreate.map((university) => ({
          updateOne: {
            filter: {
              normalizedName:
                university.normalizedName,
            },

            update: {
              $setOnInsert: {
                name: university.name,
                normalizedName:
                  university.normalizedName,
              },
            },

            upsert: true,
          },
        }));

      await University.bulkWrite(
        universityOperations,
        {
          ordered: false,
        }
      );

      /*
        Query again so we have the actual MongoDB IDs.
      */

      const allUniversities =
        await University.find({
          normalizedName: {
            $in: normalizedUniversityNames,
          },
        }).lean();

      for (const university of allUniversities) {
        universityIdMap.set(
          university.normalizedName,
          university._id
        );
      }

      universitiesCreated =
        Math.max(
          0,
          universityIdMap.size -
            universitiesBeforeImport
        );
    }

    // ============================================
    // 11. Make sure every university has an ID
    // ============================================

    const courseDocuments = [];

    for (const row of uniqueRows) {
      const normalizedUniversity =
        normalizeUniversityName(row.university);

      const normalizedCourseCode =
        normalizeCourseCode(row.courseCode);

      const universityId =
        universityIdMap.get(
          normalizedUniversity
        );

      if (!universityId) {
        errors.push({
          row: row.rowNumber,
          reason: `Could not find/create university: ${row.university}`,
        });

        continue;
      }

      courseDocuments.push({
        universityId,

        courseCode: row.courseCode.trim(),

        courseTitle: row.courseTitle.trim(),

        normalizedCourseCode,
      });
    }

    // ============================================
    // 12. Insert courses using bulkWrite
    // ============================================

    let coursesCreated = 0;
    let duplicatesSkipped = 0;

    if (courseDocuments.length > 0) {
      const courseOperations =
        courseDocuments.map((course) => ({
          updateOne: {
            filter: {
              universityId:
                course.universityId,

              normalizedCourseCode:
                course.normalizedCourseCode,
            },

            update: {
              $setOnInsert: {
                universityId:
                  course.universityId,

                courseCode:
                  course.courseCode,

                courseTitle:
                  course.courseTitle,

                normalizedCourseCode:
                  course.normalizedCourseCode,
              },
            },

            upsert: true,
          },
        }));

      const result =
        await Course.bulkWrite(
          courseOperations,
          {
            ordered: false,
          }
        );

      coursesCreated =
        result.upsertedCount || 0;

      duplicatesSkipped =
        courseDocuments.length -
        coursesCreated;
    }

    // ============================================
    // 13. Final response
    // ============================================

    return res.status(200).json({
      success: true,

      message:
        "CSV import completed successfully",

      data: {
        totalRows: rows.length,

        validRows: validRows.length,

        processedRows: uniqueRows.length,

        universitiesCreated,

        coursesCreated,

        duplicatesSkipped,

        duplicatesInsideCSV,

        failedRows: errors.length,

        errors,
      },
    });
  } catch (error) {
    console.error(
      "CSV import error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "CSV import failed",
    });
  } finally {
    // ============================================
    // 14. ALWAYS DELETE TEMPORARY CSV
    // ============================================

    if (filePath) {
      try {
        await fs.promises.unlink(filePath);

        console.log(
          "Temporary CSV deleted:",
          filePath
        );
      } catch (deleteError) {
        // File may already be deleted.
        // Do not crash the API because of cleanup.
        console.error(
          "Temporary CSV cleanup error:",
          deleteError.message
        );
      }
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

    const resourcesDeleted = await deleteResourcesByFilter(
      { university_id: universityId },
      session
    );

    const courseDeleteResult = await Course.deleteMany({ universityId }).session(session);
    await University.findByIdAndDelete(universityId).session(session);

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `University "${university.name}", ${courseDeleteResult.deletedCount} course(s), and ${resourcesDeleted} resource(s) deleted successfully`,
      data: {
        university: { _id: university._id, name: university.name },
        coursesDeleted: courseDeleteResult.deletedCount,
        resourcesDeleted,
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId).session(session);
    if (!course) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    const resourcesDeleted = await deleteResourcesByFilter(
      { course_code: course.courseCode, university_id: course.universityId },
      session
    );

    await Course.findByIdAndDelete(courseId).session(session);

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `Course "${course.courseCode}" and ${resourcesDeleted} resource(s) deleted successfully`,
      data: {
        course: {
          _id: course._id,
          courseCode: course.courseCode,
          courseTitle: course.courseTitle,
          universityId: course.universityId,
        },
        resourcesDeleted,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Delete course error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  } finally {
    session.endSession();
  }
};

exports.bulkDeleteCourses = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { courseIds } = req.body;

    if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
      await session.abortTransaction();
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

    const coursesToDelete = await Course.find({ _id: { $in: objectIds } }).session(session);

    let resourcesDeleted = 0;
    for (const course of coursesToDelete) {
      const count = await deleteResourcesByFilter(
        { course_code: course.courseCode, university_id: course.universityId },
        session
      );
      resourcesDeleted += count;
    }

    const result = await Course.deleteMany({ _id: { $in: objectIds } }).session(session);

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} course(s) and ${resourcesDeleted} resource(s) deleted successfully`,
      data: {
        deletedCount: result.deletedCount,
        resourcesDeleted,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Bulk delete courses error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  } finally {
    session.endSession();
  }
};
