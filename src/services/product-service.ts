import _ from "underscore";
import { IProductInput } from "../@types/@types";
import Product from "../db/models/product-model";
import { Logger } from "../logs/logger";
import User from "../db/models/user-model";
import BizCardsError from "../errors/BizCardsError";

//generate random barcode
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
//create product
export const productService = {
  createProduct: async (data: IProductInput, userId: string) => {
    //userId is extracted from the JWT
    const product = new Product(data);
    product.userId = userId;
    product.barcode = await generateBarcodeNumber();

    return product.save();
  },

  //get all products
  getProducts: async () => Product.find(),

  //get product by id
/*   getProduct: async (id: string) => Product.findById(id),
 */
  //get product by user id
  getProductByUserId: async (userId: string) => Product.find({ userId: userId }),


  getProductById: async (id: string) => Product.findById(id),


  toggleShoppingCart: async (userId: string, productId: string) => {
    const user = await User.findById(userId);
    if (!user) throw new BizCardsError(404, "User not found");
  
    const product = await Product.findById(productId);
    if (!product) throw new BizCardsError(404, "Product not found");
  
    // Ensure that productId is a string before comparison
    const productIdStr = productId.toString();
  
    // Find the product in the cart, checking if productId exists and is a string
    const productInCart = user.cart.find(item => item.productId?.toString() === productIdStr);
  
    if (productInCart) {
      // Remove the product from the cart
      user.cart = user.cart.filter(item => item.productId?.toString() !== productIdStr);
    } else {
      // Add the product to the cart, ensuring all necessary properties are included
      user.cart.push({
        productId: product._id,
        title: product.title,
        price: product.price,
      });
    }
  
    await user.save();
    return user.cart;
  },
  

  
  

  updateProduct: async (id: string, data: IProductInput) => {
    const product = await Product.findOneAndUpdate({ _id: id}, data, { new: true });
    return product;
  },

  deleteProduct: async (id: string, userId: string) => {
    const product = await Product.findOneAndDelete({ _id: id, $or: [{ userId: userId }, { isAdmin: true }] });
    return product;
  },

  //get shopping cart by user id
  getShoppingCart: async (userId: string) => {
    const user = await User.findById(userId);
    if (user) {
      return user.cart;
    } else {
      throw new BizCardsError(400, "User not found");
    }
  }
  
};



