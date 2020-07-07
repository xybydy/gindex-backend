const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const transport = require('../plugins/mailtransporter');

//Model Imports
const User = require("../models/user");
var allowedOrigin = process.env.NODE_ENV == "production" ? process.env.FRONTENDURL : "http://localhost:8080";

router.post('/verify', function(req, res){
	if(req.headers.origin == allowedOrigin){
		User.findOne({ email: req.body.email }, function(error, result){
			if(result){
				jwt.verify(req.body.token, process.env.TOKENSECRET, function(error, decoded){
					if(decoded){
						var expiryUnixTime = decoded.exp * 1000;
						var issuedUnixTime = decoded.iat * 1000;
						const issueDate = new Date(issuedUnixTime).toLocaleString();
						const expiryDate = new Date(expiryUnixTime).toLocaleString();
						res.status(200).send({ auth: true, registered: true, tokenuser: decoded, issuedate: issueDate, expirydate: expiryDate });
					} else {
						res.status(200).send({auth: false, registered: false, tokenuser: null});
					}
				});
			} else {
				res.status(200).send({auth: false, registered: false, tokenuser: false});
			}
		})
	} else {
		res.status(200).send({auth: false, message: "Unauthorized"});
	}
})

router.post('/changepassword', function(req, res){
	if(req.headers.origin == allowedOrigin){
		User.findOne({ email: req.body.email }, function(error, result){
			if(result){
				if(result.password != null && req.body.oldpassword != null){
					bcrypt.compare(req.body.oldpassword, result.password, function(err, synced){
						if(synced){
							var newPass = req.body.newpassword;
							User.updateOne({ email: req.body.email }, {$set: { password: bcrypt.hashSync(newPass, 10), temppassword: null }}, function(error){
								if(!error){
									res.status(200).send({ auth: true, registered: true, changed: true, message: 'Password Successfully Changed'});
								} else {
									res.status(200).send({ auth: true, registered: true, changed: false, message: 'Error While Changing password'})
								}
							})
						} else {
							res.status(200).send({ auth: true, registered: true, changed: false, message: "Paswords Do not Match with Our Records" })
						}
					})
				} else {
					res.status(200).send({ auth: false, registered: true, changed: false, message: "Password is Null. Please Enter Your Password" });
				}
			} else {
				res.status(200).send({ auth: false, registered: false, changed: false, message: "Bad Request" })
			}
		})
	} else {
		res.status(200).send({auth: false, message: "Unauthorized"});
	}
});

router.post('/delete', function(req, res){
	if(req.headers.origin == allowedOrigin){
		User.findOne({ email: req.body.email }, function(error, result){
			if(result){
				if(result.password != null && req.body.pass != null){
					bcrypt.compare(req.body.pass, result.password, function(err, synced){
						if(synced){
							User.deleteOne({ email: req.body.email }, function(error){
								if(error){
									res.status(200).send({ auth: true, registered: true, deleted: false, message: "Some Error Pinging the Servers. Try Again Later." });
								} else {
									const deleteMessage = {
										 from: `"${process.env.FRONTENDSITENAME} - Support"<${process.env.EMAILID}>`, // Sender address
										 to: req.body.email,
										 bcc: req.body.ADMINEMAIL,
										 replyTo: process.env.REPLYTOMAIL,         // List of recipients
										 subject: 'Account has been Deleted.', // Subject line
										 html: `<p>Your Account has been Deleted.</p><p>Any Issues, Reply to this Mail, Our Admins will Contact You.</p>` // Plain text body
									};
									transport.sendMail(deleteMessage, function(error, info){
										if(error){
											console.log(error);
										} else {
											console.log(info);
										}
									})
									res.status(200).send({ auth: true, registered: true, deleted: true, message: "Your Account has been deleted" });
								}
							})
						} else {
							res.status(200).send({ auth: false, registered: true, deleted: false, message: "Your Admin Password is Wrong" });
						}
					})
				} else {
					res.status(200).send({ auth: false, registered: true, deleted: false, message: "Password is Null. Please Enter Your Password" });
				}
			} else {
				res.status(200).send({ auth: false, registered: false, deleted: false, message: "BAD REQUEST" });
			}
		})
	} else {
		res.status(200).send({auth: false, message: "Unauthorized"});
	}
});

module.exports = router;
