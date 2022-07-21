import fetch from "node-fetch"
import express from "express";
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const port = 3000

const API_BASE = process.env.API_BASE ?? "http://localhost:8000"

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile("views/index.html", {"root": __dirname})
})

app.get('/dashboard', (req, res) => {
  res.sendFile("views/dashboard.html", {"root": __dirname})
})

app.get('/login', (req, res) => {
  res.sendFile("views/login.html", {"root": __dirname})
})

app.post('/login', async (req, res) => {
  const serverResp = await fetch(API_BASE + "/users/login", {
    method: "POST",
    headers:{
      'Content-Type': 'application/x-www-form-urlencoded'
    },    
    body: new URLSearchParams({
        'username': req.body.username,
        'password': req.body.password
    })
  });
  if (serverResp.status == 200) {
    res.send(await serverResp.text())
  } else {
    res.status(serverResp.status).send(JSON.stringify({"error": await serverResp.text()}))
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
