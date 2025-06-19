// ----- Import Required Modules & Libraries -----
const { GoogleGenerativeAI } = require('@google/generative-ai') // Import the main class from the Google AI library to interact with the Gemini API

const dotenv = require('dotenv') // Import a library to read .env configuration files
const express = require('express') // Import the Express.js web framework to create the server and API
const fs = require('fs') // Import Node.js' built-in 'fs' (File System) module to interact with files on the server
const multer = require('multer') // Import 'multer' middleware to handle file uploads (multipart/form-data)
const path = require('path') // Import Node.js' built-in 'path' module to work with file and directory paths.
const port = 3000 // Specifies the port on which the server will run.


// ----- Configuration & Initialization -----
dotenv.config() // Runs the dotenv configuration so that all variables in the .env file can be accessed via process.env
const app = express() // Create an Express application instance. 'app' is our web server
app.use(express.json()) // Use middleware to parse the incoming request body in JSON format to allows you read data from req.body.


// ----- Google Generative AI (Gemini) Configuration -----
const genAI = new GoogleGenerativeAI(process.env.api_key) // Initialize the GoogleGenerativeAI class with the API key from the environment variables
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash" }) // Select the specific model we will use from Gemini

// ----- Setting multer -----
const upload = multer({ dest: 'uploads/' }) // Configure multer to store uploaded files in the 'uploads' directory

// Endpoint for generate text with Gemini AI
app.post("/generate-text", async (req, res) => {
    const { prompt } = req.body // Extract the 'prompt' from the request body
    try {
        let result = await model.generateContent(prompt) // Process the prompt and waiting for Gemini to process it
        let response = result.response // Get the response from the model
        res.status(200).json({ output: response.text() }) // Send the generated text back to the client as a JSON response
    } catch (error) {
        res.status(500).json({ error: error.message }) // Send an error response if something goes wrong
    }
})

app.listen(port, () => {    
  console.log(`Server is running on http://localhost:${port}`) // Log a message to the console when the server starts
}) // Start the server and listen on the specified port