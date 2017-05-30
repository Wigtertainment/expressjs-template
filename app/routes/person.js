var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var personSchema = mongoose.Schema({
    name: String,
    age: Number,
    nationality: String
});
var Person = mongoose.model("Person", personSchema);

router.get('/persons', function (req, res) {
    Person.find(function (err, response) {
        res.json(response);
    });
});

router.put('/person/:id', function (req, res) {
    Person.findByIdAndUpdate(req.params.id, req.body, function (err, response) {
        if (err) res.json({ message: "Error in updating person with id " + req.params.id });
        res.json(response);
    });
});

router.get('/:id', function (req, res) {
    res.send('GET route on person id: ' + req.params.id);
});

router.delete('/person/:id', function (req, res) {
    Person.findByIdAndRemove(req.params.id, function (err, response) {
        if (err) res.json({ message: "Error in deleting record id " + req.params.id });
        else res.json({ message: "Person with id " + req.params.id + " removed." });
    });
});

router.post('/', function (req, res) {
    var personInfo = req.body; //Get the parsed information
    console.log(personInfo);
    if (!personInfo.name || !personInfo.age || !personInfo.nationality) {
        res.json({ message: "Sorry, you provided wrong info", type: "error" });
    } else {
        var newPerson = new Person({
            name: personInfo.name,
            age: personInfo.age,
            nationality: personInfo.nationality
        });

        newPerson.save(function (err, Person) {
            if (err)
                res.json({ message: "Database error", type: "error" });
            else
                res.json({ message: "New person added", type: "success", person: personInfo });
        });
    }
});
//export this router to use in our index.js
module.exports = router;