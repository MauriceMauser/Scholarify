Meteor.subscribe("professions");

function setProfession (context, page) {
	var _id = context.params._id;
	Session.set("profession", Professions.findOne(_id));
};

function authorizeAdmin (context, page) {
    if (!Session.get("admin?")) {
      context.redirect(Meteor.unauthorizedPath());
    }
  }

Meteor.pages({

	// Page values can be an object of options, a function or a template name string

    '/': { to: 'professionsIndex', as: 'root' },
    '/professions': { to: 'professionsIndex', as: 'professions' },
    '/professions/new': { to: 'profession_backend', as: 'new_profession' },
    '/profession/:_id': { to: 'professionShow', as: 'profession', before: setProfession, nav: 'inspire' },
    '/profession/:_id/inspire': { to: 'professionShow', before: setProfession, nav: 'inspire' },
    '/profession/:_id/learn': { to: 'professionShow', before: setProfession, nav: 'learn' },
    '/profession/:_id/proof': { to: 'professionShow', before: setProfession, nav: 'proof' },
    '/profession/:id/edit': { to: 'profession_backend', before: [setProfession, authorizeAdmin], nav: 'inspire_backend' },
    '/profession/:id/edit/inspire': { to: 'profession_backend', before: [setProfession, authorizeAdmin], nav: 'inspire_backend' },
    '/profession/:id/edit/learn': { to: 'profession_backend', before: [setProfession, authorizeAdmin], nav: 'learn_backend' },
    '/profession/:id/edit/proof': { to: 'profession_backend', before: [setProfession, authorizeAdmin], nav: 'proof_backend' },
    '/about': { to: 'about', as: 'about' },
    '/contact': { to: 'contact', as: 'contact' },
    '/401': { to: 'unauthorized'},
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
