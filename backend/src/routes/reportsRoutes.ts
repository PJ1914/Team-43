import { Router } from "express";
import { createWeekReport, getReportById, getReports } from "../controllers/reportsController";
import { exportReport } from "../controllers/exportController";
import { authenticate, authorize } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);

router.post("/create-week", authorize(["faculty", "coordinator", "admin"]), asyncHandler(createWeekReport));
router.get("/:weekId/export", asyncHandler(exportReport));
router.get("/:weekId", asyncHandler(getReportById));
router.get("/", asyncHandler(getReports));

export default router;
