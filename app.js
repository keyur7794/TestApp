var express = require('express')
var bodyParser = require("body-parser")
var app = express()
var Port = process.env.PORT || 3012

var user    = require('./Route/user.js')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use('/Test/user',user)

app.listen(Port,function(){

  console.log('server is runnning')

})