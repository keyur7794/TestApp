var express = require('express')
var express   = require("express")
var connection = require('../connection.js')
var nodemailer = require('nodemailer')
var md5 = require('md5')
var passwordValidator = require('password-validator')
var validator = require("email-validator")
var routes = express.Router()
var schema = new passwordValidator()
schema
.is().min(8)                                    // Minimum length 8 
.is().max(100)                                  // Maximum length 100 
.has().uppercase()                              // Must have uppercase letters 
.has().lowercase()                              // Must have lowercase letters 
.has().digits()                                 // Must have digits 
.has().not().spaces()                           // Should not have spaces 
.is().not().oneOf(['Passw0rd', 'Password123'])



var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "test.emilence@gmail.com",
        pass: "emilence"
    }
});


routes.post('/signup',function (req,res)
{

    var user_name = req.body.user_name ? req.body.user_name : ''
    var first_name = req.body.first_name ? req.body.first_name : ''
    var last_name = req.body.last_name ? req.body.last_name : ''
    var email = req.body.email ? req.body.email : ''
    var password = req.body.password ? req.body.password : ''
    var phone = req.body.phone ? req.body.phone : ''
    var Address = req.body.Address ? req.body.Address : ''


    if(password.trim() == "" || user_name.trim() == "" || email.trim() == ""||first_name.trim()==""||last_name.trim()=="")
    {

         return res.json({success :0 , msg :"Mandatory fields missing"})
    }else if(schema.validate(password)== false  ||    validator.validate(email)== false ){

        return res.json({success :0 , msg :"Please enter valid password or email"})

           }else {
         
                  var encrypted_password = md5(password)

                    connection.query("SELECT * FROM Persons WHERE Email= ? OR Username = ?", [email,user_name], function(error, rows) {

                        if(error){
                            return res.json({success :0 , msg :"Error in query", data: error.message})

                        }else{

                            if (rows.length > 0) {
                                res.json({ success: 0, msg: 'email or username id already registered' });
                            } else {
                                var users = {
                                    Username: user_name,
                                    FirstName: first_name,
                                    lasttName: last_name,
                                    Phone:phone,
                                    Address:Address,
                                    Email: email,
                                    Passwrd: encrypted_password,
                                   
                                    
            
                                     }
                                        
                                     connection.query("INSERT INTO Persons SET ?", [users], function(error, rows) {
                                        
                                        if (error) {
                                            res.json({ success: 0, msg: 'error in the query 2', data: error.message })
                                         }else{
                                                
                                            if (rows.affectedRows > 0) {
                                                
                                                var mailOptions = {
                                                    to: email,
                                                    subject: 'Registration successfull',
                                                    text: 'Hi,' + first_name +
                                                        ' welcome to the test app'
                                                };
                                                smtpTransport.sendMail(mailOptions, function(error, response) {
                                                    if (error) {
                                
                                                        res.json({ success: 0, msg: 'error', data: error.message });
                                                    }
                                                });
                                            
                                                res.json({ success: 1, msg: 'sign_up successfully' });
                                            } else {
                                                res.json({ success: 0, msg: 'sign_up not successfully' });
                                            }


                                         } 


                                     })





                            }

                        }
                    
                    
                    
                    
                    })
        
        
         }
   






})



routes.post('/login',function(req,res){

    var user_name = req.body.user_name ? req.body.user_name : ''
    var password = req.body.password ? req.body.password : ''

    if (user_name.trim() == '' || password.trim() == '') {
        res.json({ success: 0, msg: 'Mandatory parameter missing' });
    }else{

        var encrypted_password = md5(password);
        connection.query("SELECT * FROM Persons WHERE  Username=? AND Passwrd = ?", [user_name, encrypted_password], function(error, rows) {
            if (error) {
                res.json({ success: 0, msg: 'error in the query', data: error.message });
            }
              
            if (rows.length === 0) {
                res.json({ success: 0, msg: 'invalid email or password' });
            } else {

                res.json({ success: 1, msg: 'login successfully', data: rows[0] });
              
            }
        
        
        
        
        })



    }






})






module.exports = routes;