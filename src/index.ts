import express from 'express'
import regionRouter from "./routes/region";
import playerRouter from "./routes/player";

const app = express()

app.use(express.json())

app.use('/api', regionRouter)
app.use('/api', playerRouter)

const port = 3001;

app.listen(port, () =>
    console.log(`🚀 Server ready at: http://localhost:${port}`)
)
