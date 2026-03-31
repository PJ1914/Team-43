import { Router } from "express";
import { addEntry, deleteEntry, getSectionEntries, updateEntry, verifyEntry } from "../controllers/sectionsController";
import { authenticate, authorize } from "../middleware/auth";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.use(authenticate);

router.post("/:sectionId/add-entry", authorize(["faculty", "coordinator", "admin"]), asyncHandler(addEntry));
router.put("/:sectionId/update-entry/:entryId", authorize(["faculty", "coordinator", "admin"]), asyncHandler(updateEntry));
router.delete("/:sectionId/delete-entry/:entryId", authorize(["faculty", "coordinator", "admin"]), asyncHandler(deleteEntry));
router.put("/:sectionId/verify-entry/:entryId", authorize(["coordinator", "admin"]), asyncHandler(verifyEntry));
router.get("/:sectionId/:weekId", asyncHandler(getSectionEntries));

export default router;
