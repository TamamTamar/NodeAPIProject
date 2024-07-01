import _ from "underscore";
import { IProductInput } from "../@types/@types";
import Product from "../db/models/product-model";
import { Logger } from "../logs/logger";
import User from "../db/models/user-model";
import BizCardsError from "../errors/BizCardsError";

const generateBarcodeNumber = async () => {
  //generate random bizNumber:
  while (true) {
    const r = _.random(1_000_000, 9_999_999);
    const dbRes = await Product.findOne({ barcode: r });
    if (!dbRes) {
      return r;
    }
  }
};

export const productService = {
  createProduct: async (data: IProductInput, userId: string) => {
    //userId is extracted from the JWT
    const product = new Product(data);
    product.userId = userId;
    product.barcode = await generateBarcodeNumber();

    return product.save();
  },

  getProducts: async () => Product.find(),

  getProduct: async (id: string) => Product.findById(id),

  getProductByUserId: async (userId: string) => Product.find({ userId: userId }),

  getProductById: async (id: string) => Product.findById(id),


  toggleShoppingCart: async (userId: string, productId: string) => {
    const user = await User.findById(userId);
    const product = await Product.findById(productId);


    const isFavorite = user.cart.includes(productId);
    if (isFavorite) {
      user.cart = user.cart.filter(fav => fav.toString() !== userId);
    } else {
      user.cart.push(productId);
    }
    await user.save();
    return user.cart;
  },

  updateProduct: async (id: string, data: IProductInput, userId: string) => {
    const product = await Product.findOneAndUpdate({ _id: id, userId: userId }, data, { new: true });
    return product;
  },

  deleteProduct: async (id: string, userId: string) => {
    const product = await Product.findOneAndDelete({ _id: id, $or: [{ userId: userId }, { isAdmin: true }] });
    return product;
  },
  getShoppingCart: async (userId: string) => {
    const user = await User.findById(userId);
    if (user) {
      return user.cart;
    } else {
      throw new BizCardsError(404, "User not found");
  }
  }
};



