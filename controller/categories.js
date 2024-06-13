const { toTitleCase } = require("../config/function");
const categoryModel = require("../models/categories");
// const fs = require("fs");

class Category {
  async getAllCategory(req, res) {
    try {
      let Categories = await categoryModel.find({}).sort({ _id: -1 });
      if (Categories) {
        return res.json({ Categories });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async postAddCategory(req, res) {
    console.log(req.body);
    let { cName, cDescription, cStatus, cImage } = req.body;

    if (!cName || !cDescription || !cStatus || !cImage) {
      return res.json({ error: "All fields must be required" });
    } else {
      cName = toTitleCase(cName);

      try {
        let checkCategoryExists = await categoryModel.findOne({ cName: cName });
        if (checkCategoryExists) {
          return res.json({ error: "Category already exists" });
        } else {
          let newCategory = new categoryModel({
            cName,
            cDescription,
            cStatus,
            cImage,
          });
          await newCategory.save((err) => {
            if (!err) {
              return res.json({ success: "Category created successfully" });
            } else {
              return res.json({ error: "Failed to create category" });
            }
          });
        }
      } catch (err) {
        console.log(err);
        return res.json({
          error: "An error occurred while creating the category",
        });
      }
    }
  }

  async postEditCategory(req, res) {
    let { cId, cDescription, cStatus } = req.body;
    if (!cId || !cDescription || !cStatus) {
      return res.json({ error: "All filled must be required" });
    }
    try {
      let editCategory = categoryModel.findByIdAndUpdate(cId, {
        cDescription,
        cStatus,
        updatedAt: Date.now(),
      });
      let edit = await editCategory.exec();
      if (edit) {
        return res.json({ success: "Category edit successfully" });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getDeleteCategory(req, res) {
    let { cId } = req.body;
    if (!cId) {
      return res.json({ error: "Category ID is required" });
    }

    try {
      let deleteCategory = await categoryModel.findByIdAndDelete(cId);
      if (deleteCategory) {
        return res.json({ success: "Category deleted successfully" });
      } else {
        return res.json({ error: "Category not found" });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
  }
}

const categoryController = new Category();
module.exports = categoryController;
