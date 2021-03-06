const express = require("express");
const router = express.Router();
const transport = require('../plugins/mailtransporter');

//Model Imports
const User = require("../models/user");
const InvitedUser = require("../models/invitedUser");

var allowedOrigin = process.env.NODE_ENV == "production" ? process.env.FRONTENDURL : "http://localhost:8080";

router.post('/user', function(req, res){
	if(req.headers.origin == allowedOrigin){
		InvitedUser.findOne({ email: req.body.email, post: "User" }, function(error, result){
			if(result){
				res.status(200).send({ auth: false, registered: true, message: 'User is Already Invited. Do not Send Another Time.'});
			} else {
				User.findOne({ email: req.body.adminuseremail }, function(error, result){
					if(result){
						if(result.admin){
							User.findOne({ email: req.body.email }, function(error, result){
								if(result){
									if(result.superadmin){
										res.status(200).send({ auth: false, registered: true, message: "User is Already Present & he is a Super Admin." })
									} else {
										if(result.admin){
											res.status(200).send({ auth: false, registered: true, message: "User is Already Present & he is a Admin." })
										} else {
												res.status(200).send({ auth: false, registered: true, message: "User is Already Present" })
										}
									}
								} else {
									const newInvitedAdmin = new InvitedUser({
										name: req.body.name,
										email: req.body.email,
										post: "User",
										message: req.body.message,
										invitedby: req.body.adminuseremail
									})
									newInvitedAdmin.save(function(error, doc){
										if(error){
											res.status(200).send({ auth: false, registered: true, message: "Error Processing Your Request." })
										} else {
											const message = {
												 from: `"${process.env.FRONTENDSITENAME} - Support"<${process.env.EMAILID}>`, // Sender address
												 to: req.body.email,
												 replyTo: process.env.REPLYTOMAIL,
												 subject: `You have been Invited to ${process.env.FRONTENDSITENAME}`, // Subject line
												 html: `<p>You Have been Invited for Admin by - ${req.body.adminuseremail}. His Message to You - ${req.body.message}.</p><p> If You Accept this Invite, then go to MySettings Page and Request Admin Status.</p><p>Any Issues, Reply to this Mail, Our Admins will Contact You</p>` // Plain text body
											};
											transport.sendMail(message, function(err, info){
												if(err){
													console.log(err);
												} else {
													console.log(info);
												}
											})
											res.status(200).send({ auth: true, registered: true, message: 'An Invite Email has been Sent to his Email Address.'});
										}
									})
								}
							})
						} else {
							res.status(200).send({ auth: false, registered: true, message: "You are Unauthorized" })
						}
					} else {
						res.status(200).send({ auth: false, registered: false, message: "BAD REQUEST" })
					}
				})
			}
		})
	} else {
		res.status(200).send({auth: false, message: "Unauthorized"});
	}
})

router.post('/admin', function(req, res){
	if(req.headers.origin == allowedOrigin){
		InvitedUser.findOne({ email: req.body.email, post: "Admin" }, function(error, result){
			if(result){
				res.status(200).send({ auth: false, registered: true, message: 'User is Already Invited. Do not Send Another Time.'});
			} else {
				User.findOne({ email: req.body.adminuseremail }, function(error, result){
					if(result){
						if(result.admin){
							if(result.superadmin){
								User.findOne({ email: req.body.email }, function(error, result){
									if(result){
										if(result.superadmin){
											res.status(200).send({ auth: false, registered: true, message: "User is Already a Super Admin." })
										} else {
											if(result.admin){
												res.status(200).send({ auth: false, registered: true, message: "User is Already a Admin." })
											} else {
												const newInvitedAdmin = new InvitedUser({
													name: result.name,
													email: result.email,
													post: "Admin",
													message: req.body.message,
													invitedby: req.body.adminuseremail
												})
												newInvitedAdmin.save(function(error, doc){
													if(error){
														res.status(200).send({ auth: false, registered: true, message: "Error Processing Your Request." })
													} else {
														const message = {
															 from: `"${process.env.FRONTENDSITENAME} - Support"<${process.env.EMAILID}>`, // Sender address
															 to: req.body.email,
															 replyTo: process.env.REPLYTOMAIL,
															 subject: 'You have been Invited for Admin Post', // Subject line
															 html: `<p>You Have been Invited for Admin by - ${req.body.adminuseremail}. His Message to You - ${req.body.message}.</p><p> If You Accept this Invite, then go to MySettings Page and Request Admin Status.</p><p>Any Issues, Reply to this Mail, Our Admins will Contact You</p>` // Plain text body
														};
														transport.sendMail(message, function(err, info){
															if(err){
																console.log(err);
															} else {
																console.log(info);
															}
														})
														res.status(200).send({ auth: true, registered: true, message: 'An Invite Email has been Sent to his Email Address.'});
													}
												})
											}
										}
									} else {
										res.status(200).send({ auth: false, registered: true, message: "No User Found with This Email." })
									}
								})
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
			}
		})
	} else {
		res.status(200).send({auth: false, message: "Unauthorized"});
	}
})

router.post('/superadmin', function(req, res){
	if(req.headers.origin == allowedOrigin){
		InvitedUser.findOne({ email: req.body.email, post: "SuperAdmin"}, function(error,result){
			if(result){
				res.status(200).send({ auth: false, registered: true, message: 'User is Already Invited. Do not Send Another Time.'});
			} else {
				User.findOne({ email: req.body.adminuseremail }, function(error, result){
					if(result){
						if(result.admin){
							if(result.superadmin){
								User.findOne({ email: req.body.email }, function(error, result){
									if(result){
										if(result.superadmin){
											res.status(200).send({ auth: false, registered: true, message: "User is Already a Super Admin." })
										} else {
											if(result.admin){
												const newInvitedAdmin = new InvitedUser({
													name: result.name,
													email: result.email,
													post: "SuperAdmin",
													message: req.body.message,
													invitedby: req.body.adminuseremail
												})
												newInvitedAdmin.save(function(error, doc){
													if(error){
														res.status(200).send({ auth: false, registered: true, message: "Error Processing Your Request." })
													} else {
														const message = {
															 from: `"${process.env.FRONTENDSITENAME} - Support"<${process.env.EMAILID}>`, // Sender address
															 to: req.body.email,
															 replyTo: process.env.REPLYTOMAIL,
															 subject: 'You have been Invited for SuperAdmin Post', // Subject line
															 html: `<p>You Have been Invited for SuperAdmin by - ${req.body.adminuseremail}. His Message to You - ${req.body.message}.</p><p> If You Accept this Invite, then go to MySettings Page and Request SuperAdmin Status.</p><p>Any Issues, Reply to this Mail, Our Admins will Contact You</p>` // Plain text body
														};
														transport.sendMail(message, function(err, info){
															if(err){
																console.log(err);
															} else {
																console.log(info);
															}
														})
														res.status(200).send({ auth: true, registered: true, message: 'An Invite Email has been Sent to his Email Address.'});
													}
												})
											} else {
													res.status(200).send({ auth: false, registered: true, message: "User Should be an Admin to become a Superadmin" })
											}
										}
									} else {
										res.status(200).send({ auth: false, registered: true, message: "No User Found with This Email." })
									}
								})
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
			}
		})
	} else  {
		res.status(200).send({auth: false, message: "Unauthorized"});
	}
})

module.exports = router;
