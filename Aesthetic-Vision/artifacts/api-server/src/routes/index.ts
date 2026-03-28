import { Router, type IRouter } from "express";
import healthRouter from "./health";
import newsRouter from "./news";
import ttsRouter from "./tts";
import contentiqProxyRouter from "./contentiq-proxy";

const router: IRouter = Router();

router.use(healthRouter);
router.use(newsRouter);
router.use(ttsRouter);
router.use(contentiqProxyRouter);

export default router;
