import express from 'express';
import accountRouter from "./routes/account";
import regionRouter from "./routes/region";
import playerRouter from "./routes/player";
import statusRouter from "./routes/status";
import userRouter from "./routes/user";
import swaggerRouter from "./routes/swagger";
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(express.json());

// Status
app.use('/', statusRouter);
app.use('/api', statusRouter);

// Swagger
app.use('/', swaggerRouter);

// Account
app.use('/', accountRouter);

// API Region
app.use('/api', regionRouter);

// API Player
app.use('/api', playerRouter);

// Admin User
app.use('/admin', userRouter);

const port = process.env.PORT || 3001;

app.listen(port, () =>
    console.log(`🚀 Server ready at: http://localhost:${port}`)
)

export default app;
