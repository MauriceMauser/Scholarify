Meteor.subscribe("professions");

admin = 'PjpNzed76d7ztJYAg'; //To-Do: SAFE ON SERVER !!

/////// Helpers ////////

function setProfession (context, page) {
	var _id = context.params._id;
	Session.set("profession", Professions.findOne(_id));
};


function authorizeAdmin (context, page) {
    var userId = Meteor.userId();
    if (userId != admin) {
      context.redirect(Meteor.unauthorizedPath());
    }
};

Handlebars.registerHelper("navClassFor", function (nav, options) {
      return Meteor.router.navEquals(nav) ? "active" : "";
  });


////////////////////////////


/////// Router ////////

Meteor.pages({

	// Page values can be an object of options, a function or a template name string

    '/': { to: 'professionsIndex', as: 'root' },
    '/professions': { to: 'professionsIndex', as: 'professions' },
    '/professions/new': { to: 'profession_backend', as: 'new_profession', before: authorizeAdmin },
    '/profession/:_id': { to: 'professionShow', as: 'profession', before: setProfession, nav: 'inspire' },
    '/profession/:_id/inspire': { to: 'professionShow', before: setProfession, nav: 'inspire' },
    '/profession/:_id/learn': { to: 'professionShow', before: setProfession, nav: 'learn' },
    '/profession/:_id/proof': { to: 'professionShow', before: setProfession, nav: 'proof' },
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

////////////////////////////


/////// Professions ////////

/////// INDEX ////////

Template.professionsIndex.helpers({
professions: function () { 
		return Professions.find();
		}
	});

/////// SHOW ////////

Template.professionShow.helpers({
	profession: function () {
		return Session.get("profession");
		},
    profession_tab: function () {
        return Meteor.router 
        }
	});

Template.professionShow.events({
    //To-Do: DRY edit_description and edit_requirements
   'click .edit_description': function () { 
        if (admin == Meteor.userId())
        {
            Session.set("editing", 'edit_description');  console.log("edit description");
        }
    },
   'focus #profession_description': function () { document.getElementById("profession_description").select(); },
   'blur #profession_description': function (event, template) {
            var description = template.find("#profession_description").value;
            Meteor.call('updateProfession', Session.get("profession"), { description: description }, function (error) {
                    if (! error) { console.log("Profession updated."); }
                }); 
            Session.set("editing");
        },
   'click .edit_requirements': function () { 
        if (admin == Meteor.userId()) 
        {
            Session.set("editing", 'edit_requirements');  console.log("edit requirements");
        }
    },
   'focus #profession_requirements': function () { document.getElementById("profession_requirements").select(); },
   'blur #profession_requirements': function (event, template) {
            var requirements = template.find("#profession_requirements").value;
            Meteor.call('updateProfession', Session.get("profession"), { requirements: requirements }, function (error) {
                    if (! error) { console.log("Profession updated."); }
                }); 
            Session.set("editing");
        }
});

Template.inspire.editing_description = function () {
    if (admin == Meteor.userId())
        { return Session.equals("editing", 'edit_description'); }
}; 

Template.inspire.editing_requirements = function () {
    if (admin == Meteor.userId()) {
            return Session.equals("editing", 'edit_requirements');  
        }  
};

Template.professionPin.truncated_description = function () {
    return this.description.substring(0,120);
};

Template.learn.materialHTML = function () {
    return new Handlebars.SafeString(this.material);
};

/////// EDIT ////////

Template.learn_backend.rendered = function () {
    (function () {
            $('#redactor_content').redactor({ fixed: true });
        }());
};

Template.profession_backend.events({
    'click .save': function (event, template) {
        var title = template.find("#profession_title").value;
        var sponsor = template.find("#profession_sponsor").value;
        var description = template.find("#profession_description").value;
        var video = template.find("#profession_video").value;
        var image = template.find("#profession_image").value;
        var requirements = template.find("#profession_requirements").value;
        var material = template.find("#redactor_content").value;

        if (title.length && description.length && video.length && image.length && material.length) {
            Meteor.call('publishProfession', {
                title: title,
                sponsor: sponsor,
                description: description,
                videoUrl: video,
                imgUrl: image,
                requirements: requirements,
                material: material
                }, function (error) {
                    if (! error) { console.log("New profession created."); }
                }
            );
        } else {
            Session.set("publishError", "A profession requires a title, description, video, image and material.")
        }
    }
});


Template.profession_backend.error = function () {
    return Session.get("publishError");
};

////////////////////////////