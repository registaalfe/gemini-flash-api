// ----- import required modules & libraries -----
const { GoogleGenerativeAI } = require('@google/generative-ai') // import the main class from the Google AI library to interact with the Gemini API

const dotenv = require('dotenv') // import a library to read .env configuration files
const express = require('express') // import the Express.js web framework to create the server and API
const fs = require('fs') // import Node.js' built-in 'fs' (File System) module to interact with files on the server
const multer = require('multer') // import 'multer' middleware to handle file uploads (multipart/form-data)
const path = require('path') // import Node.js' built-in 'path' module to work with file and directory paths.
const port = 3000 // specifies the port on which the server will run.


// ----- configuration & initialization -----
dotenv.config() // runs the dotenv configuration so that all variables in the .env file can be accessed via process.env
const app = express() // create an Express application instance. 'app' is our web server
app.use(express.json()) // use middleware to parse the incoming request body in JSON format to allows you read data from req.body.


// ----- google generative AI (Gemini) configuration -----
const genAI = new GoogleGenerativeAI(process.env.api_key) // Initialize the GoogleGenerativeAI class with the API key from the environment variables
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" }) // Select the specific model we will use from Gemini

// ----- setting multer -----
const upload = multer({ dest: 'uploads/' }) // configure multer to store uploaded files in the 'uploads' directory

// endpoint for generate text with Gemini AI
app.post("/generate-text", async (req, res) => {
    const { prompt } = req.body // extract the 'prompt' from the request body
    try {
        let result = await model.generateContent(prompt) // process the prompt and waiting for Gemini to process it
        let response = result.response // get the response from the model
        res.status(200).json({ output: response.text() }) // send the generated text back to the client as a JSON response
    } catch (error) {
        res.status(500).json({ error: error.message }) // send an error response if something goes wrong
    }
})

// converts an image file into the specific object format
const imageGeneratePart = (filePath) => ({
    inlineData: {
        mimeType: 'image/png', // specify the MIME type of the image
        data: fs.readFileSync(filePath).toString('base64') // read the image file and convert it to a base64 string
    }
})

// endpoint for generate image with Gemini AI
app.post("/generate-from-image", upload.single('image'), async (req, res) => {
    const prompt = req.body.prompt || 'Describe the picture' // extract the 'prompt' from the request body    
    const image = imageGeneratePart(req.file.path) // prepare the image part for the request using the uploaded file path

    try {
        let result = await model.generateContent([prompt, image]) // process the prompt and waiting for Gemini to process it
        let response = result.response // get the response from the model
        res.status(200).json({ output: response.text() }) // send the generated text back to the client as a JSON response
    } catch (error) {
        res.status(500).json({ error: error.message }) // send an error response if something goes wrong
    } finally {
        fs.unlinkSync(req.file.path) // delete the uploaded file
    }
})

// endpoint for read document to text with Gemini AI
app.post("/generate-from-document", upload.single('document'), async (req, res) => {
    const prompt = req.body.prompt || 'Analyze this document' // extract the 'prompt' from the request body    
    const filePath = req.file.path // get the path of the uploaded file
    const buffer = fs.readFileSync(filePath) // read the file content into a buffer
    const base64 = buffer.toString('base64') // convert the buffer to a base64 string
    const mimeType = req.file.mimetype // get the MIME type of the uploaded file

    try {
        const documentPart = {
            inlineData: {
                data: base64, mimeType // convert the buffer to a base64 string
            }
        }
        let result = await model.generateContent([`analyze this document`, documentPart]) // process the prompt and waiting for Gemini to process it
        let response = result.response // get the response from the model
        res.status(200).json({ output: response.text() }) // send the generated text back to the client as a JSON response
    } catch (error) {
        res.status(500).json({ error: error.message }) // send an error response if something goes wrong
    } finally {
        fs.unlinkSync(req.file.path) // delete the uploaded file
    }
})

// endpoint for generate audio with Gemini AI
app.post("/generate-from-audio", upload.single('audio'), async (req, res) => {    
    const audioBuffer = fs.readFileSync(req.file.path) // read the audio file content into a buffer
    const audioBase64 = audioBuffer.toString('base64') // convert the buffer to a base64 string
    const audioPart = {
        inlineData: {
            data: audioBase64, // the base64 encoded audio data
            mimeType: req.file.mimetype // the MIME type of the audio file
        }
    }

    try {
        const result = await model.generateContent([`transcribe this audio`, audioPart]) // process the audio and waiting for Gemini to process it
        const response = await result.response // get the response from the model
        res.json({ output: response.text() }) // send the generated text back to the client as a JSON response
    } catch (err) {
        res.status(500).json({ error: err.message }) // send an error response if something goes wrong
    } finally {
        fs.unlinkSync(req.file.path)
    }
})

app.listen(port, () => {    
  console.log(`Server is running on http://localhost:${port}`) // log a message to the console when the server starts
}) // start the server and listen on the specified port