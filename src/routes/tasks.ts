import {Router} from "express";
import {authenticate} from "../middleware/auth.js";
import {pool} from "../db.js";
import {createTaskSchema, updateTaskSchema} from "../zodSchemas/schemas.js";

const router = Router();

router.use(authenticate);

router.post("/", async (req, res) => {
    const parsed = createTaskSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({error: parsed.error.issues});
    }

    const {title} = parsed.data;

    try {
        const result = await pool.query(
            `INSERT INTO tasks (title, user_id)
             VALUES ($1, $2) RETURNING *`,
            [title, req.userId]
        );
        res.status(200).json(result.rows[0]);
    } catch (e) {
        res.status(500).json({error: "Internal Server Error"});
    }
});

router.get("/", async (req, res) => {
    try {
        const result = await pool.query(`SELECT *
                                         FROM tasks
                                         WHERE user_id = $1
                                         ORDER BY created_at DESC`, [req.userId]);
        res.json(result.rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({error: "Internal Server Error"});
    }
})

router.patch("/:id", async (req, res) => {
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body:', req.body);
    const parsed = updateTaskSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(400).json({error: parsed.error.issues})
    }

    const {id} = req.params;
    const {title, done} = parsed.data;

    try {
        const result = await pool.query(
            `UPDATE tasks
             SET title = COALESCE($1, title),
                 done  = COALESCE($2, done)
             WHERE id = $3
               AND user_id = $4 RETURNING *`,
            [title, done, id, req.userId]
        )
        if (result.rows.length === 0) {
            return res.status(404).json({error: "Task not found"});
        }
        res.status(200).json(result.rows[0]);
    } catch (e) {
        console.error(e);
        res.status(500).json({error: "Internal Server Error"});
    }
})

router.delete("/:id", async (req, res) => {
    try {
        const result = await pool.query(
            `DELETE
             FROM tasks
             WHERE id = $1
               AND user_id = $2 RETURNING *`,
            [req.params.id, req.userId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({error: "Task not found"});
        }
        res.status(204).send();
    } catch (e) {
        console.error(e);
        res.status(500).json({error: "Internal Server Error"});
    }
})

export default router;