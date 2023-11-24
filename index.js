const express = require('express')
const app = express()
const cors = require('cors')
require("dotenv").config();
const port = process.env.PORT || 5000

// midleware

app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
  res.send('Medical Camps Server Running!-.......')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})