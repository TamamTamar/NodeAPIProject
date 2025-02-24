import { Router } from "express";
import { validateProduct } from "../middleware/joi";
import {  productService } from "../services/product-service";
import { isBusiness } from "../middleware/is-business";
import { validateToken } from "../middleware/validate-token";
import { isAdmin } from "../middleware/is-admin";
import isProductId from "../middleware/is-product-Id";



const router = Router();


//delete product
router.delete("/:id", ...isAdmin, isProductId, async (req, res, next) => {
  try {
    const productId = req.params.id;
    const deletedProduct = await productService.deleteProduct(productId);
    res.json({ message: "Product deleted successfully", product: deletedProduct });
  } catch (e) {
    next(e);
  }
});

//update product
router.put("/:id", ...isAdmin,isProductId, async (req, res, next) => {
  try {
    //const userId = req.payload._id;
    const productId = req.params.id;
    const productData = req.body;

    const updatedProduct = await productService.updateProduct(productId, productData);
    res.json(updatedProduct);
  } catch (e) {
    next(e);
  }
});


/* router.get("/my-products", validateToken, async (req, res, next) => {
  try {
    const products = await productService.getProductByUserId(req.payload._id);
    res.json(products);
  } catch (e) {
    next(e);
  }
}); */
  

//create product
router.post("/", ...isBusiness, validateProduct, async (req, res, next) => {
  try {
    const result = await productService.createProduct(req.body, req.payload._id);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

//get all products
router.get("/", async (req, res, next) => {
  try {
    const products = await productService.getProducts();
    res.json(products);
  } catch (e) {
    next(e);
  }
});

//get product by id
router.get("/:id", isProductId, async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    res.json(product);
  } catch (e) {
    next(e);
  }
});

//toggle shopping cart

router.patch("/:id/shopping-cart", validateToken,isProductId, async (req, res, next) => {
  try {
    const userId = req.payload._id;
    const productId = req.params.id;
    const cart = await productService.toggleShoppingCart(userId, productId);
    res.json(cart);
  } catch (e) {
    next(e);
  }
});

//get shopping cart
router.get("/shopping-cart/all", validateToken, async (req, res, next) => {
  try {
    const userId = req.payload._id;
    const products = await productService.getShoppingCart(userId);
    res.json(products);
  } catch (e) {
    next(e);
  }
});



export { router as productRouter };
