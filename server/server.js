adminIdDevelopment = "8cghKjxFgq34qCMHY";
adminIdProduction = "kqjMpabZNdXWQmTMw";

Meteor.startup(function() {
	//process.env.MAIL_URL = ''; REMOVED MAIL_URL

	adminId = Meteor.users.findOne({_id: adminIdProduction}) ? adminIdProduction : adminIdDevelopment;

	Meteor.users.update({_id: adminId},
                           {$set: {isAdmin: true, isMaster: true} });

	if (Professions.find().count() > 0) return;

	for (var i = 0; i < 6; i++) {
		Professions.insert({
			title: "Software Engineering",
			description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
			imgUrl: "http://placehold.it/280x170",
			videoUrl: "http://www.youtube.com/embed/AY4ajbu_G3k",
			requirements: "Java, C++, Model-View-Controller",
			material: '<h4>Material</h2><div class="well"><p>MATERIAL</p></div>'
		});
	}
});

//// PROFESSIONS ////
Meteor.publish("professions", function() {
	return Professions.find();
});

//// MASTERPIECES ////
Meteor.publish("masterpieces", function() {
	return Masterpieces.find();
});

//// REVIEWS ////
Meteor.publish("reviews", function() {
	return Reviews.find();
});

//// USERS ////
Meteor.publish("userData", function () {
  return Meteor.users.find({_id: this.userId},
                           {fields: {'isAdmin': 1, 'isMaster': 1}});
});

Meteor.publish("directory", function () {
	return Meteor.users.find({}, {fields: {username: 1, profile: 1}});
});
