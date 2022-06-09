import express from "express";
import UserRoutes from "./user.routes";

const router = express.Router();

router.get("/", (req: express.Request, res: express.Response) => {
  return res.send("Api Working");
});

router.use("/user", UserRoutes);

export default router;
