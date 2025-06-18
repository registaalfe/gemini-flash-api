const dotenv = require('dotenv')
const express = require('express')
const multer = require('multer') // input data
const fs = require('fs') // input data
const path = require('path') // input data
const port = 3000 // setting utk express
const { GoogleGenerativeAI } = require('@google/generative-ai')

dotenv.config()
const app = express() // prepare for app routes
app.use(express.json()) // utk baca json di express

const genAI = new GoogleGenerativeAI(process.env.api_key)
const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-flash' })

// setting multer
const upload = multer({ dest: 'uploads/' })

// console.log(process.env.api_key)
// // run()

//endpoint for file upload
// app.post("/generative-text", async (req, res) => {
//     const { prompt } = req.body
//     try {
//         let result = await model.generateContent(prompt)
//         let response = await result.response

//         res.status(200).json({
//             text: response.candidates[0].content,
//             usage: response.usage
//         })
//     } catch (error) {
//         console.error('Error generating text:', error)
//         res.status(500).json({ error: 'Failed to generate text' })
//     }
// })

//endpoint for generate text
app.post("/generate-text", async (req, res) => {
    const { prompt } = req.body
    try {
        let result = await model.generateContent(prompt)
        let response = await result.response

        res.status(200).json({ output: response.text})
    } catch (error) {
        res.status(500).json({ error: 'Failed to generate text' })
    }
})

//endpoint for read image to text with gemini
const imageGeneratePart = (filePath) => ({
    inlineData: {
        data: fs.readFileSync(filePath).toString('base64'),
        mimeType: 'image/jpg'
    }
})

app.post('/generate-from-image', upload.single('image'), async (req, res) => {
    const prompt = req.body.prompt || 'describe the picture'
    const image = imageGeneratePart(req.file.path)
  
    try {
      let result = await model.generateContent([prompt, image])
      let response = result.response
      // console.log(response.text())
      res.status(200).json({ output: response.text() })
    } catch (error) {
      // console.log(error)
      res.status(500).json({ error: error.message })
    }
  })

app.listen(port, () => {
  console.log(`this gemini api running on localhost ${port}`)
})
