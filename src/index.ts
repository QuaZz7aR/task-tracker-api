import express from 'express'
import authRouter from './routes/auth.js'
import taskRouter from './routes/tasks.js'

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.use('/', authRouter);

app.use('/tasks', taskRouter);

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});