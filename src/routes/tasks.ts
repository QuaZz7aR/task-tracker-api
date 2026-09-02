import {Router} from "express";
import {authenticate} from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

router.get('/', (req, res) => {
    res.json({message: `Your userId is ${req.userId}`})
})

export default router;