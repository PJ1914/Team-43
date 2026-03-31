import { Router } from "express";
import { getUsers, updateUserRole } from "../controllers/adminController";
import { authenticate, authorize } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);

router.get("/users", authorize(["admin", "coordinator"]), asyncHandler(getUsers));
router.put("/users/:uid/role", authorize(["admin"]), asyncHandler(updateUserRole));

export default router;
