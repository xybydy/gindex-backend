const express = require("express");
const router = express.Router();
const transport = require('../plugins/mailtransporter');
const bcrypt = require("bcrypt");

//Model Imports
const User = require("../models/user");

var allowedOrigin = process.env.NODE_ENV == "production" ? process.env.FRONTENDURL : "http://localhost:8080";

router.post('/user', function(req, res){
	if(req.headers.origin == allowedOrigin){
		User.findOne({ email: req.body.adminuseremail }, function(error, result){
			if(result){
				if(result.admin){
					if(result.password != null && req.body.adminpass != null){
						bcrypt.compare(req.body.adminpass, result.password, function(err, synced){
							if(synced){
								if(result.temprestricted){
									res.status(200).send({ auth: false, registered: true, deleted: false, message: "You Have been Temporarily Restricted from Modifying Permissions of Users." });
								} else {
									User.findOne({ email: req.body.email }, function(error, result){
										if(result){
											if(result.admin){
												res.status(200).send({ auth: false, registered: true, deleted: false, message: "You are Trying to Remove a Admin. Permission Scope Not there." });
											} else {
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
															 html: `<p>Your Account has been Deleted by Super Admin - ${req.body.adminuseremail}</p><p>Any Issues, Reply to this Mail, Our Admins will Contact You.</p>` // Plain text body
														};
														transport.sendMail(deleteMessage, function(error, info){
															if(error){
																console.log(error);
															} else {
																console.log(info);
															}
														})
														res.status(200).send({ auth: true, registered: true, deleted: true, message: "User has been deleted" });
													}
												})
											}
										} else {
											res.status(200).send({ auth: true, registered: true, deleted: false, message: "No User Found with this Email" });
										}
									})
								}
							} else {
								res.status(200).send({ auth: false, registered: true, deleted: false, message: "Your Admin Password is Wrong" });
							}
						})
					} else {
						res.status(200).send({ auth: false, registered: true, deleted: false, message: "Password is Null. Please Enter Your Password" });
					}
				} else {
					res.status(200).send({ auth: false, registered: false, deleted: false, message: "You are Unauthorized" });
				}
			} else {
				res.status(200).send({ auth: false, registered: false, deleted: false, message: "BAD REQUEST" });
			}
		})
	} else {
		res.status(200).send({auth: false, message: "Unauthorized"});
	}
});

router.post('/admin', function(req, res){
	if(req.headers.origin == allowedOrigin){
		User.findOne({ email: req.body.adminuseremail }, function(error, result){
			if(result){
				if(result.admin && result.superadmin){
					if(result.password != null && req.body.adminpass != null){
						bcrypt.compare(req.body.adminpass, result.password, function(err, synced){
							if(synced){
								if(result.temprestricted){
									res.status(200).send({ auth: false, registered: true, deleted: false, message: "You Have been Temporarily Restricted from Modifying Permissions of Users." });
								} else {
									User.findOne({ email: req.body.email }, function(error, result){
										if(result){
											User.deleteOne({ email: req.body.email }, function(error){
												if(error){
													res.status(200).send({ auth: true, token: true, registered: true, deleted: false, message: "Some Error Pinging the Servers. Try Again Later." });
												} else {
													const deleteMessage = {
														 from: `"${process.env.FRONTENDSITENAME} - Support"<${process.env.EMAILID}>`, // Sender address
														 to: req.body.email,
														 bcc: req.body.ADMINEMAIL,
														 replyTo: process.env.REPLYTOMAIL,         // List of recipients
														 subject: 'Account has been Deleted.', // Subject line
														 html: `<p>Your Account has been Deleted by Super Admin - ${req.body.adminuseremail}</p><p>Any Issues, Reply to this Mail, Our Admins will Contact You.</p>` // Plain text body
													};
													transport.sendMail(deleteMessage, function(error, info){
														if(error){
															console.log(error);
														} else {
															console.log(info);
														}
													});
													res.status(200).send({ auth: true, registered: true, deleted: true, message: "User has been deleted" });
												}
											})
										} else {
											res.status(200).send({ auth: true, registered: true, deleted: false, message: "No User Found with this Email" });
										}
									})
								}
							} else {
								res.status(200).send({ auth: false, registered: true, deleted: false, message: "Your Admin Password is Wrong" });
							}
						})
					} else {
						res.status(200).send({ auth: false, registered: true, deleted: false, message: "Password is Null. Please Enter Your Password" });
					}
				} else {
					res.status(200).send({ auth: false, registered: false, deleted: false, message: "You are Unauthorized" });
				}
			} else {
				res.status(200).send({ auth: false, registered: false, deleted: false, message: "BAD REQUEST" });
			}
		})
	}	else {
		res.status(200).send({auth: false, message: "Unauthorized"});
	}
})

module.exports = router;
