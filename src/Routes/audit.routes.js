import { Router } from "express";
import { completeAudit, createAudit, getUserAudit, getUserCompletedAudit } from "../Controllers/audit.controller.js";

const router = Router();

router.route("/create").post(createAudit);
router.route("/complete/:auditId").put(completeAudit);
router.route("/get").get(getUserAudit);
router.route("/completed").get(getUserCompletedAudit);
// router.route("/delete/:id").delete();

export default router;
