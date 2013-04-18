Meteor.subscribe("professions");

setProfession = function (context, page) {
	var _id = context.params._id;
	Session.set("profession", Professions.findOne(_id));
};

Meteor.pages({

	// Page values can be an object of options, a function or a template name string

    '/': { to: 'professionsIndex', as: 'root' },
    '/professions': { to: 'professionsIndex', as: 'professions' },
    '/profession/:_id': { to: 'professionShow', as: 'profession', before: setProfession, nav: 'inspire' },
    '/profession/:_id/inspire': { to: 'professionShow', before: setProfession, nav: 'inspire' },
    '/profession/:_id/learn': { to: 'professionShow', before: setProfession, nav: 'learn' },
    '/profession/:_id/proof': { to: 'professionShow', before: setProfession, nav: 'proof' },
    '/backend': { to: 'profession_backend' },
    '/about': { to: 'about', as: 'about' },
    '/contact': { to: 'contact', as: 'contact' },
    '*': 'notFound'
  }, {

    // optional options to pass to the PageRouter

    defaults: {
      layout: 'layout'
    }

});

Handlebars.registerHelper("navClassFor", function (nav, options) {
      return Meteor.router.navEquals(nav) ? "active" : "";
  });

Template.professionsIndex.helpers({
professions: function () { 
		return Professions.find();
		}
	});

Template.professionShow.helpers({
	profession: function () {
		return Session.get("profession");
		},
    profession_tab: function () {
        return Meteor.router 
    }
	});

Template.professionPin.truncated_description = function () {
    return this.description.substring(0,120);
};

Template.learn.materialHTML = function () {
    return new Handlebars.SafeString(this.material);
};
