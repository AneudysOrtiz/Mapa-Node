const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser')
const fs = require('fs');
const path = require('path');

var app = express();
app.use(cors());
app.use(bodyParser.json());

app.listen(8000, function () {
    console.log("Server listening in port 8000")
});

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/bounds', (req, res) => {
    axios.get(`https://nominatim.openstreetmap.org/search.php?polygon_geojson=1&format=json&q=${req.query.search}`)
        .then(function (response) {
            console.log(response);
            res.send(response.data);
        })
        .catch(function (error) {
            console.log(error.response);
            res.send("error");
        });
});

app.get('/sectores', (req, res) => {
    let sectorFind = req.query.nombre.toLowerCase();
    fs.readFile('sectores.json', (err, data) => {
        if (err) throw err;
        let json = JSON.parse(data);
        let tmp = json.features.find(x => x.properties.Name.toLowerCase() == sectorFind);
        if (!tmp) {
            res.send([]);
            return;
        }
        let coordinates = tmp.geometry.coordinates[0];
        res.send(coordinates);
    });
});

app.get('/bordes', (req, res) => {
    fs.readFile('sectores.json', (err, data) => {
        if (err) throw err;
        var bounds = [];
        let json = JSON.parse(data);
        json.features.forEach(element => {
            console.log(element)
            let coords = element.geometry.coordinates[0];
            let tmp = [];
            coords.forEach(x => {
                let points = {
                    lat: x[1],
                    lng: x[0]
                }
                tmp.push(points);
            })
            bounds.push({ nombre: element.properties.Name, coords: tmp });
        });
        res.send(bounds);
    });
});