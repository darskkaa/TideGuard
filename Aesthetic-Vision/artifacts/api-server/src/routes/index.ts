import { Router, type IRouter } from "express";
import healthRouter from "./health";
import newsRouter from "./news";
import ttsRouter from "./tts";
import contentiqProxyRouter from "./contentiq-proxy";
import hurricaneRouter from "./hurricane";
import hurricaneNewsRouter from "./hurricane-news";
import watsonxClaimsRouter from "./watsonx-claims";
import floodZonesRouter from "./flood-zones";

const router: IRouter = Router();

router.use(healthRouter);
router.use(newsRouter);
router.use(ttsRouter);
router.use(contentiqProxyRouter);
router.use(hurricaneRouter);
router.use(hurricaneNewsRouter);
router.use(watsonxClaimsRouter);
router.use(floodZonesRouter);

export default router;
