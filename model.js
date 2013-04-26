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

/////// Methods ////////

Meteor.methods({
	publishProfession: function (options) {
		options = options || {};
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
		options = options || {};
		return Professions.update(profession, {$set: options});
	},
	deleteProfession: function (profession) {
		return Professions.remove(profession);
	}
});

////////////////////////////
