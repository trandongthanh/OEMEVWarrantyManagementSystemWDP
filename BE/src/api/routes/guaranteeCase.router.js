import express from "express";
import caselineRouter from "./caseLine.router.js";

const router = express.Router();

router.use("/:caseId/case-lines", caselineRouter);

export default router;
