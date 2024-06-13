const productModel = require("../models/products");

class Product {
  // Delete Image from uploads -> products folder
  // static deleteImages(images, mode) {
  //   var basePath =
  //     path.resolve(__dirname + "../../") + "/public/uploads/products/";
  //   console.log(basePath);
  //   for (var i = 0; i < images.length; i++) {
  //     let filePath = "";
  //     if (mode == "file") {
  //       filePath = basePath + `${images[i].filename}`;
  //     } else {
  //       filePath = basePath + `${images[i]}`;
  //     }
  //     console.log(filePath);
  //     if (fs.existsSync(filePath)) {
  //       console.log("Exists image");
  //     }
  //     fs.unlink(filePath, (err) => {
  //       if (err) {
  //         return err;
  //       }
  //     });
  //   }
  // }

  async getAllProduct(req, res) {
    try {
      let Products = await productModel
        .find({})
        .populate("pCategory", "_id cName")
        .sort({ _id: -1 });

      if (Products) {
        // console.log(Products);
        return res.json({ Products });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async postAddProduct(req, res) {
    console.log("bb", req.body);
    let {
      pName,
      pDescription,
      pPrice,
      pQuantity,
      pCategory,
      pOffer,
      pStatus,
      pImage,
    } = req.body;

    // Validation
    if (
      !pName ||
      !pDescription ||
      !pPrice ||
      !pQuantity ||
      !pCategory ||
      !pOffer ||
      !pStatus
    ) {
      return res.json({ error: "All fields must be required" });
    }

    // Validate Name and description
    else if (pName.length > 255 || pDescription.length > 3000) {
      return res.json({
        error:
          "Name must not exceed 255 characters & Description must not exceed 3000 characters",
      });
    }

    // Validate Images
    else if (!Array.isArray(pImage) || pImage.length !== 2) {
      return res.json({ error: "Must provide exactly 2 images" });
    } else {
      try {
        // Save the new product
        let newProduct = new productModel({
          pImages: pImage, // Assuming pImage is an array of URLs
          pName,
          pDescription,
          pPrice,
          pQuantity,
          pCategory,
          pOffer,
          pStatus,
        });

        let save = await newProduct.save();
        if (save) {
          return res.json({ success: "Product created successfully" });
        }
      } catch (err) {
        console.log(err);
        return res.json({ error: "Something went wrong" });
      }
    }
  }

  async postEditProduct(req, res) {
    console.log("Request body:", req.body);

    let {
      pId,
      pName,
      pDescription,
      pPrice,
      pQuantity,
      pCategory,
      pOffer,
      pStatus,
      pImages,
    } = req.body;
    let editImages = req.body.pImage;

    // Validate other fields
    if (
      !pId ||
      !pName ||
      !pDescription ||
      !pPrice ||
      !pQuantity ||
      !pCategory ||
      !pOffer ||
      !pStatus
    ) {
      return res.json({ error: "All fields must be required" });
    }

    // Validate Name and description
    if (pName.length > 255 || pDescription.length > 3000) {
      return res.json({
        error:
          "Name must be less than 255 characters and description must be less than 3000 characters",
      });
    }

    // Validate Update Images
    if (editImages && editImages.length !== 2) {
      return res.json({ error: "Must provide exactly 2 images" });
    }

    let editData = {
      pName,
      pDescription,
      pPrice,
      pQuantity,
      pCategory,
      pOffer,
      pStatus,
    };

    if (editImages && editImages.length === 2) {
      try {
        let allEditImages = [];
        for (const img of editImages) {
          console.log("Uploading image:", img);

          console.log("Uploaded image URL:", editImages);
          allEditImages.push(editImages);
        }
        editData.pImages = allEditImages;

        // Deleting old images if necessary
        if (pImages) {
          console.log("Deleting old images:", pImages);
          // Product.deleteImages(pImages.split(","), "string");
        }
      } catch (error) {
        console.error("Failed to upload images to imgbb:", error);
        return res.json({ error: "Failed to upload images to imgbb" });
      }
    }

    try {
      console.log("Updating product with data:", editData);
      let editProduct = productModel.findByIdAndUpdate(pId, editData, {
        new: true,
      });
      editProduct.exec((err, updatedProduct) => {
        if (err) {
          console.error("Failed to edit product:", err);
          return res.json({ error: "Failed to edit product" });
        }
        console.log("Product edited successfully:", updatedProduct);
        return res.json({
          success: "Product edited successfully",
          product: updatedProduct,
        });
      });
    } catch (err) {
      console.error("An error occurred while editing the product:", err);
      return res.json({ error: "An error occurred while editing the product" });
    }
  }

  async getDeleteProduct(req, res) {
    let { pId } = req.body;
    if (!pId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        // let deleteProductObj = await productModel.findById(pId);
        let deleteProduct = await productModel.findByIdAndDelete(pId);
        if (deleteProduct) {
          // Delete Image from uploads -> products folder
          // Product.deleteImages(deleteProductObj.pImages, "string");
          return res.json({ success: "Product deleted successfully" });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async getSingleProduct(req, res) {
    let { pId } = req.body;
    if (!pId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let singleProduct = await productModel
          .findById(pId)
          .populate("pCategory", "cName")
          .populate("pRatingsReviews.user", "name email userImage");
        if (singleProduct) {
          return res.json({ Product: singleProduct });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  async getProductByCategory(req, res) {
    let { catId } = req.body;
    if (!catId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let products = await productModel
          .find({ pCategory: catId })
          .populate("pCategory", "cName");
        if (products) {
          return res.json({ Products: products });
        }
      } catch (err) {
        return res.json({ error: "Search product wrong" });
      }
    }
  }

  async getProductByPrice(req, res) {
    let { price } = req.body;
    if (!price) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let products = await productModel
          .find({ pPrice: { $lt: price } })
          .populate("pCategory", "cName")
          .sort({ pPrice: -1 });
        if (products) {
          return res.json({ Products: products });
        }
      } catch (err) {
        return res.json({ error: "Filter product wrong" });
      }
    }
  }

  async getWishProduct(req, res) {
    let { productArray } = req.body;
    if (!productArray) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let wishProducts = await productModel.find({
          _id: { $in: productArray },
        });
        if (wishProducts) {
          return res.json({ Products: wishProducts });
        }
      } catch (err) {
        return res.json({ error: "Filter product wrong" });
      }
    }
  }

  async getCartProduct(req, res) {
    let { productArray } = req.body;
    if (!productArray) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let cartProducts = await productModel.find({
          _id: { $in: productArray },
        });
        if (cartProducts) {
          return res.json({ Products: cartProducts });
        }
      } catch (err) {
        return res.json({ error: "Cart product wrong" });
      }
    }
  }

  async postAddReview(req, res) {
    let { pId, uId, rating, review } = req.body;
    if (!pId || !rating || !review || !uId) {
      return res.json({ error: "All filled must be required" });
    } else {
      let checkReviewRatingExists = await productModel.findOne({ _id: pId });
      if (checkReviewRatingExists.pRatingsReviews.length > 0) {
        checkReviewRatingExists.pRatingsReviews.map((item) => {
          if (item.user === uId) {
            return res.json({ error: "Your already reviewd the product" });
          } else {
            try {
              let newRatingReview = productModel.findByIdAndUpdate(pId, {
                $push: {
                  pRatingsReviews: {
                    review: review,
                    user: uId,
                    rating: rating,
                  },
                },
              });
              newRatingReview.exec((err, result) => {
                if (err) {
                  console.log(err);
                }
                return res.json({ success: "Thanks for your review" });
              });
            } catch (err) {
              return res.json({ error: "Cart product wrong" });
            }
          }
        });
      } else {
        try {
          let newRatingReview = productModel.findByIdAndUpdate(pId, {
            $push: {
              pRatingsReviews: { review: review, user: uId, rating: rating },
            },
          });
          newRatingReview.exec((err, result) => {
            if (err) {
              console.log(err);
            }
            return res.json({ success: "Thanks for your review" });
          });
        } catch (err) {
          return res.json({ error: "Cart product wrong" });
        }
      }
    }
  }

  async deleteReview(req, res) {
    let { rId, pId } = req.body;
    if (!rId) {
      return res.json({ message: "All filled must be required" });
    } else {
      try {
        let reviewDelete = productModel.findByIdAndUpdate(pId, {
          $pull: { pRatingsReviews: { _id: rId } },
        });
        reviewDelete.exec((err, result) => {
          if (err) {
            console.log(err);
          }
          return res.json({ success: "Your review is deleted" });
        });
      } catch (err) {
        console.log(err);
      }
    }
  }
}

const productController = new Product();
module.exports = productController;
