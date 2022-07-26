import fetch from "node-fetch"
import express from "express";
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const port = process.env.PORT ?? 3000;

const API_BASE = process.env.API_BASE ?? "http://localhost:8000"

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile("views/index.html", {"root": __dirname})
})

app.get('/dashboard', (req, res) => {
  res.sendFile("views/dashboard.html", {"root": __dirname})
})

app.get('/search', async (req, res) => {
  res.send(await(await fetch(`${API_BASE}/songs?q=` + req.query.q, {
    method: 'GET'
  })).text());
})

app.get('/songs/recommendations', async (req, res) => {
  res.send(await(await fetch(`${API_BASE}/songs/recommendations`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': req.headers.authorization
    }
  })).text())
})

app.get("/songs/favorite", async (req, res) => {
  const serverResp = await fetch(`${API_BASE}/songs/favorite`, {
    method: 'GET',
    headers: req.headers
  })
  if (serverResp.status === 200) {
    res.send(await serverResp.text())
  } else {
    res.status(serverResp.status).send({"error": await serverResp.text()})
  }
})

app.post("/songs/start", async (req, res) => {
  console.log(req.body);
  const serverResp = await fetch(`${API_BASE}/history`, {
    method: "POST",
    headers: req.headers,
    body: req.body.songId
  })
  if (serverResp.status === 200) {
    res.send(await serverResp.text())
  } else {
    res.status(serverResp.status).send({"error": await serverResp.text()})
  }
})

app.post("/songs/end", async (req, res) => {
  console.log(req.body.historyId);
  fetch(`${API_BASE}/history/${req.body.historyId}`, {
    method: "PATCH",
    headers: req.headers,
  }).then(async response => {
    if (response.status === 200) {
      res.send(await response.text())
    } else {
      res.status(response.status).send(JSON.stringify({"error": await response.json()}))
    }
  })
})


app.get('/users/recommendations', async (req, res) => {
  res.send(await(await fetch(`${API_BASE}/users/recommendations`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': req.headers.authorization
    }
  })).json())
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
    res.status(serverResp.status).send({"error": await serverResp.text()})
  }
})

app.get("/me", async (req, res) => {
  const serverResp = await fetch(API_BASE + "/users/me", {
    method: "GET",
    headers: req.headers
  });
  if (serverResp.status == 200) {
    res.send(await serverResp.text())
  } else {
    res.status(serverResp.status).send({"error": await serverResp.text()})
  }
})

app.post("/connect", async (req, res) => {
  fetch(API_BASE + `/users/connect/${req.body.user_id}`, {
    method: "POST",
    headers: req.headers
  }).then(async resp => {
    if (resp.status == 200) {
      res.send(await resp.text())
    } else {
      res.status(resp.status).send(JSON.stringify({"error": await resp.json()}));
    }
  })
})

app.delete("/connect", async (req, res) => {
  const serverResp = await fetch(API_BASE + `/users/connect/${req.body.user_id}`, {
    method: "DELETE",
    headers: req.headers
  })
  if (serverResp.status == 200) {
    res.send(await serverResp.text())
  } else {
    res.status(serverResp.status).send({"error": await serverResp.text()});
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
