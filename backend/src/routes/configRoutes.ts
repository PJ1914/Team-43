import { Router } from "express";
import { getSections, getDepartments, getSchemas } from "../controllers/configController";

const router = Router();

router.get("/sections", getSections);
router.get("/departments", getDepartments);
router.get("/schemas", getSchemas);

export default router;
