import { Router, type IRouter } from "express";
import healthRouter from "./health";
import enhancedHealthRouter from "./health-enhanced";
import authRouter from "./auth";
import roomsRouter from "./rooms";
import balanceRouter from "./balance";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/health", enhancedHealthRouter);
router.use("/auth", authRouter);
router.use("/rooms", roomsRouter);
router.use("/balance", balanceRouter);

export default router;
