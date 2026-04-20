import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './configs/mongodb.js'
import { clerkWebhooks, stripeWebhooks } from './controllers/webhooks.js'
import educatorRouter from './routes/educatorRoutes.js'
import { clerkMiddleware } from '@clerk/express'
import connectCloudinary from './configs/cloudinary.js'
import courseRouter from './routes/courseRouter.js'
import userRouter from './routes/userRouter.js'
import adminRoutes from './routes/adminRoutes.js'
import errorHandler from './middlewares/errorMiddleware.js'


import path from "path"
import { fileURLToPath } from "url"
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

await connectDB()
connectCloudinary()

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://learn.devendrajat.com"
    ],
    credentials: true,
  })
);

// Stripe needs raw body
app.use('/stripe', (req, res, next) => {
  if (req.method === 'POST') {
    let rawBody = Buffer.alloc(0)
    req.on('data', chunk => { rawBody = Buffer.concat([rawBody, chunk]) })
    req.on('end', () => { req.body = rawBody; next() })
    req.on('error', err => { res.status(400).send('Error reading request body') })
  } else {
    next()
  }
})

app.get('/', (req, res) => {
  res.send("LMS API is working")
})

app.post('/stripe', stripeWebhooks)
app.get('/stripe', (req, res) => res.send('Stripe webhook endpoint is ready'))

app.use(express.json())
app.use(clerkMiddleware())

app.post('/clerk', clerkWebhooks)
app.use('/api/educator', educatorRouter)
app.use('/api/course', courseRouter)
app.use('/api/user', userRouter)
app.use('/api/admin', adminRoutes)

app.use(errorHandler)

// SERVE FRONTEND BUILD (Correct Path)
const clientDistPath = path.join(__dirname, "../client/dist")
app.use(express.static(clientDistPath))

app.use((req, res) => {
  res.sendFile(path.join(clientDistPath, "index.html"))
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
})
