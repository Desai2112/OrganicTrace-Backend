import { Router } from "express";
import { createProduct,
    getUserProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getAllProducts,
 } from "../Controllers/product.controller.js";

const router=Router();

router.route("/add").post(createProduct);
router.route("/get").get(getUserProducts);
router.route("/getAll").get(getAllProducts);
router.route("/get/:id").get(getProductById);
router.route("/update/:id").put(updateProduct);
router.route("/delete/:id").delete(deleteProduct);


export default router;