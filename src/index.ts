import {pool} from './db.js'
import express from 'express'
import {z} from 'zod'

const registeredSchema = z.object({
 email: z.email(),
 password: z.string().min(8),
})

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
 res.send('Server is running');
})



app.listen(PORT, () => {
 console.log(`Server listening on ${PORT}`);
})