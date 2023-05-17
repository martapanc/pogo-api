import express from 'express'
import accountRouter from "./routes/account";
import regionRouter from "./routes/region";
import playerRouter from "./routes/player";
import statusRouter from "./routes/status";
import userRouter from "./routes/user";
import * as dotenv from 'dotenv'

dotenv.config()

const app = express()

app.use(express.json())

app.use('/', statusRouter)
app.use('/api', statusRouter)

app.use('/', accountRouter);

app.use('/api', regionRouter)
app.use('/api', playerRouter)

app.use('/admin', userRouter)

const port = process.env.PORT || 3001;

app.listen(port, () =>
    console.log(`🚀 Server ready at: http://localhost:${port}`)
)

export default app;
