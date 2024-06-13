const fs = require("fs");
const categoriesFolder = "./public/uploads/categories";
const customizeFolder = "./public/uploads/customize";
// const productsFolder = "./public/uploads/products";
const productsFolder = "./public/uploads/products";

// const categoriesFolder = require("../public/uploads/categories");
// const customizeFolder = require("../public/uploads/customize");
// const productsFolder = require("../public/uploads/products");

const CreateAllFolder = () => {
  try {
    if (!fs.existsSync(categoriesFolder)) {
      fs.mkdirSync(categoriesFolder, {
        recursive: true,
      });
    }
  } catch (err) {
    console.error(err);
  }

  try {
    if (!fs.existsSync(customizeFolder)) {
      fs.mkdirSync(customizeFolder, {
        recursive: true,
      });
    }
  } catch (err) {
    console.error(err);
  }

  try {
    if (!fs.existsSync(productsFolder)) {
      fs.mkdirSync(productsFolder, {
        recursive: true,
      });
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports = CreateAllFolder;
