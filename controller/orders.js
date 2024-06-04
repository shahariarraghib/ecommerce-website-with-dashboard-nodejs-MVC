const mongoose = require("mongoose");
const orderModel = require("../models/orders");
const productModel = require("../models/products");
class Order {
  async getAllOrders(req, res) {
    try {
      let Orders = await orderModel
        .find({})
        .populate("allProduct.id", "pName pImages pPrice")
        .populate("user", "name email")
        .sort({ _id: -1 });
      if (Orders) {
        return res.json({ Orders });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getOrderByUser(req, res) {
    let { uId } = req.body;
    if (!uId) {
      return res.json({ message: "All filled must be required" });
    } else {
      try {
        let Order = await orderModel
          .find({ user: uId })
          .populate("allProduct.id", "pName pImages pPrice")
          .populate("user", "name email")
          .sort({ _id: -1 });
        if (Order) {
          return res.json({ Order });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  // async postCreateOrder(req, res) {
  //   let { allProduct, user, amount, transactionId, address, phone } = req.body;
  //   if (
  //     !allProduct ||
  //     !user ||
  //     !amount ||
  //     !transactionId ||
  //     !address ||
  //     !phone
  //   ) {
  //     return res.json({ message: "All filled must be required" });
  //   } else {
  //     try {
  //       let newOrder = new orderModel({
  //         allProduct,
  //         user,
  //         amount,
  //         transactionId,
  //         address,
  //         phone,
  //       });
  //       let save = await newOrder.save();
  //       if (save) {
  //         return res.json({ success: "Order created successfully" });
  //       }
  //     } catch (err) {
  //       return res.json({ error: error });
  //     }
  //   }
  // }

  async postCreateOrder(req, res) {
    let { allProduct, user, amount, transactionId, address, phone } = req.body;
    console.log("Received order details:", {
      allProduct,
      user,
      amount,
      transactionId,
      address,
      phone,
    });

    if (
      !allProduct ||
      !user ||
      !amount ||
      !transactionId ||
      !address ||
      !phone
    ) {
      return res.json({ message: "All fields must be required" });
    } else {
      // Correct the keys if necessary
      allProduct = allProduct.map((item) => ({
        productId: item.id,
        quantity: item.quantitiy, // Note the typo in 'quantitiy'
      }));

      let session;
      try {
        // Start a session and transaction
        session = await mongoose.startSession();
        session.startTransaction();
        // Array to store product details
        let productDetails = [];
        // Decrement product quantities and gather product details
        for (let item of allProduct) {
          console.log("Processing item:", item);

          // Ensure item.productId exists and is valid
          if (!item.productId) {
            throw new Error("Product ID is missing for one of the items");
          }

          let product = await productModel
            .findById(item.productId)
            .session(session);
          if (!product) {
            throw new Error(`Product with ID ${item.productId} not found`);
          }

          if (product.pQuantity < item.quantity) {
            throw new Error(`Not enough stock for product ${product.pName}`);
          }

          product.pQuantity -= item.quantity;
          product.pSold += item.quantity;
          await product.save({ session });
          // Add product details to the array
          productDetails.push({
            id: product._id,
            pName: product.pName,
            pImages: product.pImages,
            quantity: item.quantity,
            price: item.price,
          });

          console.log("Product details added:", {
            id: product._id,
            pName: product.pName,
            pImages: product.pImages,
            quantity: item.quantity,
            price: item.price,
          });
        }

        // Create new order with product details
        let newOrder = new orderModel({
          allProduct: productDetails,
          user,
          amount,
          transactionId,
          address,
          phone,
        });
        console.log(newOrder);
        // Save the order
        let save = await newOrder.save({ session });

        // Commit the transaction
        await session.commitTransaction();
        session.endSession();

        if (save) {
          return res.json({ success: "Order created successfully" });
        }
      } catch (err) {
        // Abort the transaction and rollback changes
        if (session) {
          await session.abortTransaction();
          session.endSession();
        }
        console.error(err); // Log the error for debugging purposes
        return res.json({ error: err.message || "An error occurred" });
      }
    }
  }

  async postUpdateOrder(req, res) {
    let { oId, status } = req.body;
    if (!oId || !status) {
      return res.json({ message: "All filled must be required" });
    } else {
      let currentOrder = orderModel.findByIdAndUpdate(oId, {
        status: status,
        updatedAt: Date.now(),
      });
      currentOrder.exec((err, result) => {
        if (err) console.log(err);
        return res.json({ success: "Order updated successfully" });
      });
    }
  }

  async postDeleteOrder(req, res) {
    let { oId } = req.body;
    if (!oId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let deleteOrder = await orderModel.findByIdAndDelete(oId);
        if (deleteOrder) {
          return res.json({ success: "Order deleted successfully" });
        }
      } catch (error) {
        console.log(error);
      }
    }
  }
}

const ordersController = new Order();
module.exports = ordersController;
