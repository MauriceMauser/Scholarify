/////// Professions ////////

Professions = new Meteor.Collection("professions");

Professions.allow({
	insert: function (userId, profession) {
		return userId && admin === userId; 
	},
	update:  function (userId, profession) {
		return userId && admin === userId; 
	},
	remove: function (userId, profession) {
		return userId && admin === userId; 
	}
});

////////////////////////////