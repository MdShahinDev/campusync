const Resource = require("../model/Resource");
const path = require("path");
const { put, del } = require("@vercel/blob");

const generateResourceId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `RES-${timestamp}-${random}`.toUpperCase();
};

exports.uploadResource = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return res.status(500).json({
        success: false,
        message: "File storage not configured. Please set BLOB_READ_WRITE_TOKEN.",
      });
    }

    const { course_code, course_title, resource_type, university_id, university_name } = req.body;

    if (!university_id || !university_name) {
      return res.status(400).json({
        success: false,
        message: "University is required",
      });
    }

    if (!course_code || !course_title || !resource_type) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const validTypes = ["PDF", "PPTX", "Image"];
    if (!validTypes.includes(resource_type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid resource type. Must be PDF, PPTX, or Image",
      });
    }

    const fileExt = path.extname(req.file.originalname).toLowerCase();
    const typeValidation = {
      PDF: [".pdf"],
      PPTX: [".pptx"],
      Image: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
    };

    if (!typeValidation[resource_type].includes(fileExt)) {
      return res.status(400).json({
        success: false,
        message: `Invalid file type for ${resource_type}. Allowed: ${typeValidation[resource_type].join(", ")}`,
      });
    }

    const resourceId = generateResourceId();
    const blobName = `resources/${resourceId}${fileExt}`;

    const blob = await put(blobName, req.file.buffer, {
      contentType: req.file.mimetype,
      access: "private",
    });

    const resource = await Resource.create({
      resource_id: resourceId,
      university_id,
      university_name: university_name.trim(),
      course_code,
      course_title,
      resource_type,
      file_url: blob.url,
      file_name: req.file.originalname,
      uploader_id: req.user._id,
      uploader_name: req.user.name,
      uploader_role: req.user.role,
    });

    res.status(201).json({
      success: true,
      message: "Resource uploaded successfully",
      data: { resource },
    });
  } catch (error) {
    console.error("Upload resource error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.getResources = async (req, res) => {
  try {
    const filter = req.user.role === "admin"
      ? {}
      : { uploader_id: req.user._id };
    const resources = await Resource.find(filter).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: { resources },
    });
  } catch (error) {
    console.error("Get resources error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findOne({ resource_id: req.params.id });
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }
    res.status(200).json({
      success: true,
      data: { resource },
    });
  } catch (error) {
    console.error("Get resource error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getPublicResources = async (req, res) => {
  try {
    const resources = await Resource.find()
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: { resources },
    });
  } catch (error) {
    console.error("Get public resources error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.downloadResource = async (req, res) => {
  try {
    const resource = await Resource.findOne({ resource_id: req.params.id });
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    if (!resource.file_url) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const blobResponse = await fetch(resource.file_url, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!blobResponse.ok) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch file from storage",
      });
    }

    const ext = resource.file_name.split(".").pop();
    const contentType = {
      pdf: "application/pdf",
      pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
    }[ext] || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Disposition", `attachment; filename="${resource.file_name}"`);

    const reader = blobResponse.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } catch (error) {
    console.error("Download resource error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findOne({ resource_id: req.params.id });
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: "Resource not found",
      });
    }

    const isOwner = resource.uploader_id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";
    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this resource",
      });
    }

    if (resource.file_url) {
      try {
        await del(resource.file_url);
      } catch (blobError) {
        console.error("Blob delete error:", blobError);
      }
    }

    await Resource.findByIdAndDelete(resource._id);

    res.status(200).json({
      success: true,
      message: "Resource deleted successfully",
    });
  } catch (error) {
    console.error("Delete resource error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
