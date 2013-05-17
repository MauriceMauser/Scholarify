/////// Professions ////////

Professions = new Meteor.Collection("professions");

Professions.allow({
	insert: function (userId, profession) {
		return false; //no cowboy insert -- use publishProfession method
	},
	update:  function (userId, profession) {
		return userId && adminId === userId; 
	},
	remove: function (userId, profession) {
		return userId && adminId === userId; 
	}
});

////////////////////////////

/////// Masterpieces ////////

Masterpieces = new Meteor.Collection("masterpieces");

Masterpieces.allow({
	insert: function (userId, masterpiece) {
		return false; //no cowboy insert -- use publishProfession method
	},
	update:  function (userId, masterpiece) {
		return userId && masterpiece.owner === userId; 
	},
	remove: function (userId, masterpiece) {
		return userId && masterpiece.owner === userId; 
	}
});

////////////////////////////

/////// Reviews ////////

Reviews = new Meteor.Collection("reviews");

Reviews.allow({
	insert: function (userId, review) {
		return false; //no cowboy insert -- use submitMasterpiece method
	},
	update:  function (userId, review) {
		return userId && review.owner === userId; 
	},
	remove: function (userId, review) {
		return userId && review.owner === userId; 
	}
});

////// Applicants ////////

Applicants = new Meteor.Collection("applicants");

Applicants.allow({
	insert: function () {
		return false; //no cowboy insert -- use createApplicant method
	}
});

////////////////////////////

/////// Methods ////////

Meteor.methods({
	//Accounts
	updateProfile: function (options) {
		var options = options || {};
		var user = Meteor.user();
		return Meteor.users.update(user, {
			$set: {
				profile: {
					name: options.name,
					location: options.location,
					education: options.education,
					experience: options.experience,
					imageUrl: options.imageUrl
				}
			}
		});
	},
	//Applicants
	createApplicant: function (options) {
		var options = options || {};
		var userId = Meteor.userId();
		if (! (typeof options.name === "string" && options.name.length && 
			   typeof options.email === "string" && options.email.length &&
			   typeof options.qualifications === "string" && options.qualifications.length &&
   			   typeof options.project === "string" && options.project.length))
			throw new Meteor.error(400, "Please fill out the form completely.");

		if (Meteor.isServer) {
			Email.send('mailer@scholarify.mailgun.org',
                'maurice.mauser@scholarify.com',
                'New Master Application!',
                options.mailer_text);
		}

		return Applicants.insert({
			owner: userId,
			name: options.name,
			email: options.email,
			qualifications: options.qualifications,
			project: options.project
			});
	},
	//Professions
	publishProfession: function (options) {
		var options = options || {};
		if (! (typeof options.title === "string" && options.title.length && 
			   typeof options.description === "string" && options.description.length &&
			   typeof options.videoUrl === "string" && options.videoUrl.length &&
   			   typeof options.imgUrl === "string" && options.imgUrl.length &&
			   typeof options.requirements === "string" && options.requirements.length &&
			   typeof options.material === "string" && options.material.length &&
			   typeof options.specs.length))
			throw new Meteor.error(400, "Please fill out the form completely.");
		if (options.title.length > 100)
			throw new Meteor.error(413, "The title is too long.");
		if (options.description.length > 1000)
			throw new Meteor.error(413, "The description is too long.");
		if (options.requirements.length > 1000)
			throw new Meteor.error(413, "The requirements text is too long.");
		if (! this.userId)
			throw new Meteor.error(403, "You must be logged in");

		return Professions.insert({
			creator: this.userId,
			title: options.title,
			sponsor: options.sponsor,
			description: options.description,
			imgUrl: options.imgUrl,
			videoUrl: options.videoUrl,
			requirements: options.requirements,
			material: options.material,
			specs: options.specs
			});
	},
	updateProfession: function (profession, options) {
		var options = options || {};
		return Professions.update(profession, {$set: options});
	},
	deleteProfession: function (profession) {
		return Professions.remove(profession);
	},
	//Masterpieces
	submitMasterpiece: function (options) {
		var project = options || {};
		if (! this.userId)
			{ throw new Meteor.error(403, "You must be logged in"); }
		else { 
				project['owner'] = this.userId;
		 	 }
		return Masterpieces.insert(project);
	},
	//Reviews
	submitReview: function (options) {
		var review = options || {};	
		if (! this.userId)
			{ throw new Meteor.error(403, "You must be logged in"); }
		else { 
				review['owner'] = this.userId;
		 	 }
		return Reviews.insert(review);
	},
	//Mailers
	sendEmail: function (to, from, subject, text) {
	    check([to, from, subject, text], [String]);
	    // Let other method calls from the same client start running,
	    // without waiting for the email sending to complete.
	    this.unblock();

	    Email.send({
	      to: to,
	      from: from,
	      subject: subject,
	      text: text
	    });
  	}
});

////////////////////////////

