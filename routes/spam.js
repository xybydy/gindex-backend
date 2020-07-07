const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const transport = require('../plugins/mailtransporter');

//Model Imports
const User = require("../models/user");
const SpamUser = require("../models/spamUser");

var allowedOrigin = process.env.NODE_ENV == "production" ? process.env.FRONTENDURL : "http://localhost:8080";

router.post('/user', function(req, res){
	if(req.headers.origin == allowedOrigin){
		User.findOne({ email: req.body.adminuseremail }, function(error, result){
			if(result){
				if(result.admin){
					if(bcrypt.compareSync(req.body.adminpass, result.password)){
						User.findOne({ email: req.body.email }, function(error, result){
							if(result){
								const spamUser = new SpamUser({
									name: result.name,
									email: result.email,
									flaggedby: req.body.adminuseremail,
									message: req.body.message
								})
								spamUser.save(function(error, doc){
									if(error){
										res.status(200).send({ auth: true, registered: false, message: "Error Processing Request. Try Again Later" });
									} else {
										const message = {
											 from: `"${process.env.FRONTENDSITENAME} - Support"<${process.env.EMAILID}>`, // Sender address
											 to: req.body.email,
											 replyTo: process.env.REPLYTOMAIL,
											 subject: 'You Have Been Flagged', // Subject line
											 html: `<p>You Have been Flagged by Admin - ${req.body.adminuseremail} for the Reason - ${req.body.message}.</p><p>Any Issues, Reply to this Mail, Our Admins will Contact You</p>` // Plain text body
										};
										transport.sendMail(message, function(err, info){
											if(err){
												console.log(err);
											} else {
												console.log(info);
											}
										})
										res.status(200).send({ auth: true, registered: true, message: 'User has Been Added to Spam User Database.'});
									}
								})
							} else {
								res.status(200).send({ auth: false, registered: false, message: "BAD REQUEST" })
							}
						})
					} else {
						res.status(200).send({ auth: false, registered: true, message: "Your Admin Password does Not Match with our Records" })
					}
				} else {
					res.status(200).send({ auth: false, registered: true, message: "You are Unauthorized" })
				}
			} else {
				res.status(200).send({ auth: false, registered: false, message: "BAD REQUEST" })
			}
		})
	} else {
		res.status(200).send({auth: false, message: "Unauthorized"});
	}
})

router.post('/admin', function(req, res){
	if(req.headers.origin == allowedOrigin){
		User.findOne({ email: req.body.adminuseremail }, function(error, result){
			if(result){
				if(result.admin){
					if(result.superadmin){
						if(bcrypt.compareSync(req.body.adminpass, result.password)){
							User.findOne({ email: req.body.email }, function(error, result){
								if(result){
									const spamUser = new SpamUser({
										name: result.name,
										email: result.email,
										flaggedby: req.body.adminuseremail,
										message: req.body.message
									})
									spamUser.save(function(error, doc){
										if(error){
											res.status(200).send({ auth: true, registered: false, message: "Error Processing Request. Try Again Later" });
										} else {
											const message = {
												 from: `"${process.env.FRONTENDSITENAME} - Support"<${process.env.EMAILID}>`, // Sender address
												 to: req.body.email,
												 replyTo: process.env.REPLYTOMAIL,
												 subject: 'You Have Been Flagged', // Subject line
												 html: `<p>You Have been Flagged by Admin - ${req.body.adminuseremail} for the Reason - ${req.body.message}.</p><p>Any Issues, Reply to this Mail, Our Admins will Contact You</p>` // Plain text body
											};
											transport.sendMail(message, function(err, info){
												if(err){
													console.log(err);
												} else {
													console.log(info);
												}
											})
											res.status(200).send({ auth: true, registered: true, message: 'Admin has Been Added to Spam User Database.'});
										}
									})
								} else {
									res.status(200).send({ auth: false, registered: false, message: "BAD REQUEST" })
								}
							})
						} else {
							res.status(200).send({ auth: false, registered: true, message: "Your Admin Password does Not Match with our Records" })
						}
					} else {
						res.status(200).send({ auth: false, registered: true, message: "You are Unauthorized" })
					}
				} else {
					res.status(200).send({ auth: false, registered: true, message: "You are Unauthorized" })
				}
			} else {
				res.status(200).send({ auth: false, registered: false, message: "BAD REQUEST" })
			}
		})
	} else {
		res.status(200).send({auth: false, message: "Unauthorized"});
	}
})

module.exports = router;
