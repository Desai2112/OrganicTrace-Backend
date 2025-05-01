import { Router } from "express";
import { createInventory,updateInventory,getUserInventories } from "../Controllers/inventory.controller";

const router = Router();

router.route("/create").post(createInventory);
router.route("/update/:inventoryId").put(updateInventory);
router.route("/get").get(getUserInventories);

export default router;
