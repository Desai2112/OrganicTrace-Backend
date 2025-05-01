import { Router } from "express";
import { getUserTracking, getTrackingByProductId,transferProduct,getDistributorTracking,acceptProduct,getDistributorDeliveredProduct } from "../Controllers/tracking.controller.js";

const router = Router();

router.route("/").get(getUserTracking);
router.route("/track/:productId").get(getTrackingByProductId);
router.route("/:trackingId").put(transferProduct);
router.route("/distributor").get(getDistributorTracking);
router.route("/accept/:trackingId").put(acceptProduct);
router.route("/distributor/delivered").get(getDistributorDeliveredProduct);


export default router;