const Component = require("../model/Component");
const Activity = require("../model/Activity");
const User = require("../model/User");
const path = require("path");
const { put, del } = require("@vercel/blob");

const generateComponentId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `CMP-${timestamp}-${random}`.toUpperCase();
};

exports.createComponent = async (req, res) => {
  try {
    if (req.user.role === "student" && !req.user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Your account is not verified. Please wait for verification by an administrator before creating components.",
      });
    }

    const { name, description, category, quantity, condition, location, buyingDate } = req.body;

    if (!name || !category) {
      return res.status(400).json({
        success: false,
        message: "Name and category are required",
      });
    }

    let parsedBuyingDate = null;
    if (buyingDate) {
      const dateObj = new Date(buyingDate);
      if (isNaN(dateObj.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid buying date",
        });
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (dateObj >= today) {
        return res.status(400).json({
          success: false,
          message: "Buying date must be a previous date",
        });
      }
      parsedBuyingDate = dateObj;
    }

    let universityId = null;
    if (req.user.university) {
      universityId = req.user.university;
    } else if (req.user.role === "student") {
      const fullUser = await User.findById(req.user._id).select("university");
      if (fullUser && fullUser.university) {
        universityId = fullUser.university;
      }
    }

    let imageUrl = "";

    if (req.file) {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return res.status(500).json({
          success: false,
          message: "File storage not configured. Please set BLOB_READ_WRITE_TOKEN.",
        });
      }

      const componentId = generateComponentId();
      const ext = path.extname(req.file.originalname).toLowerCase();
      const blobName = `components/${componentId}${ext}`;

      const blob = await put(blobName, req.file.buffer, {
        contentType: req.file.mimetype,
        access: "private",
      });

      imageUrl = blob.url;
    }

    const qty = parseInt(quantity) || 1;

    const component = await Component.create({
      name: name.trim(),
      description: description || "",
      category: category.trim(),
      owner_id: req.user._id,
      owner_name: req.user.name,
      owner_username: req.user.username || "",
      quantity: qty,
      available_quantity: qty,
      condition: condition || "Good",
      image_url: imageUrl,
      location: location || "",
      buyingDate: parsedBuyingDate,
      university: universityId,
    });

    await Activity.create({
      type: "COMPONENT_CREATED",
      actor: { userId: req.user._id, name: req.user.name, role: req.user.role },
      target: { id: component._id, name: component.name, model: "Component" },
      description: `${req.user.name} added component "${component.name}"`,
    });

    res.status(201).json({
      success: true,
      message: "Component created successfully",
      data: { component },
    });
  } catch (error) {
    console.error("Create component error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.getComponents = async (req, res) => {
  try {
    const { category, search, available } = req.query;
    const filter = { is_active: true };

    if (category) filter.category = category;
    if (available === "true") filter.available_quantity = { $gt: 0 };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const components = await Component.find(filter).populate("university", "name").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { components },
    });
  } catch (error) {
    console.error("Get components error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getComponentById = async (req, res) => {
  try {
    const component = await Component.findById(req.params.id).populate("university", "name");
    if (!component) {
      return res.status(404).json({
        success: false,
        message: "Component not found",
      });
    }

    res.status(200).json({
      success: true,
      data: { component },
    });
  } catch (error) {
    console.error("Get component error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getMyComponents = async (req, res) => {
  try {
    const components = await Component.find({ owner_id: req.user._id }).populate("university", "name").sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      data: { components },
    });
  } catch (error) {
    console.error("Get my components error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.updateComponent = async (req, res) => {
  try {
    const component = await Component.findById(req.params.id);
    if (!component) {
      return res.status(404).json({
        success: false,
        message: "Component not found",
      });
    }

    if (
      component.owner_id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this component",
      });
    }

    const textFields = ["name", "description", "category", "quantity", "condition", "location", "is_active"];
    textFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        component[field] = field === "quantity" ? Math.max(1, parseInt(req.body[field]) || 1) : req.body[field];
      }
    });

    if (req.body.buyingDate !== undefined) {
      if (req.body.buyingDate === "" || req.body.buyingDate === null) {
        component.buyingDate = null;
      } else {
        const dateObj = new Date(req.body.buyingDate);
        if (isNaN(dateObj.getTime())) {
          return res.status(400).json({ success: false, message: "Invalid buying date" });
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (dateObj >= today) {
          return res.status(400).json({ success: false, message: "Buying date must be a previous date" });
        }
        component.buyingDate = dateObj;
      }
    }

    if (req.file) {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return res.status(500).json({
          success: false,
          message: "File storage not configured.",
        });
      }

      if (component.image_url) {
        try {
          await del(component.image_url);
        } catch (blobError) {
          console.error("Blob delete error:", blobError);
        }
      }

      const ext = path.extname(req.file.originalname).toLowerCase();
      const blobName = `components/${component._id}${ext}`;

      const blob = await put(blobName, req.file.buffer, {
        contentType: req.file.mimetype,
        access: "private",
      });

      component.image_url = blob.url;
    }

    await component.save();

    res.status(200).json({
      success: true,
      message: "Component updated successfully",
      data: { component },
    });
  } catch (error) {
    console.error("Update component error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

exports.getComponentImage = async (req, res) => {
  try {
    const component = await Component.findById(req.params.id);
    if (!component) {
      return res.status(404).json({
        success: false,
        message: "Component not found",
      });
    }

    if (!component.image_url) {
      return res.status(404).json({
        success: false,
        message: "Image not found",
      });
    }

    const blobResponse = await fetch(component.image_url, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!blobResponse.ok) {
      return res.status(500).json({
        success: false,
        message: "Failed to fetch image from storage",
      });
    }

    const ext = component.image_url.split(".").pop().split("?")[0];
    const contentType = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
    }[ext] || "application/octet-stream";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");

    const reader = blobResponse.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } catch (error) {
    console.error("Get component image error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.deleteComponent = async (req, res) => {
  try {
    const component = await Component.findById(req.params.id);
    if (!component) {
      return res.status(404).json({
        success: false,
        message: "Component not found",
      });
    }

    if (
      component.owner_id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this component",
      });
    }

    if (component.image_url) {
      try {
        await del(component.image_url);
      } catch (blobError) {
        console.error("Blob delete error:", blobError);
      }
    }

    await Component.findByIdAndDelete(req.params.id);

    await Activity.create({
      type: "COMPONENT_DELETED",
      actor: { userId: req.user._id, name: req.user.name, role: req.user.role },
      target: { id: component._id, name: component.name, model: "Component" },
      description: `${req.user.name} deleted component "${component.name}"`,
    });

    res.status(200).json({
      success: true,
      message: "Component deleted successfully",
    });
  } catch (error) {
    console.error("Delete component error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
