const port = 8080;
const express = require('express')
const app = express()

app.listen(port , () => {
    console.log(`App listening at http://localhost:${port}`);
});