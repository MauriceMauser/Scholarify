Meteor.subscribe("professions");

Deps.autorun( function () {
    Meteor.subscribe("userData");
    userId = Meteor.userId();
    current_user = Meteor.users.findOne({_id: userId});
    isAdmin = (current_user && current_user.isAdmin) || false;
    Session.set("admin", isAdmin);
    console.log(current_user);
    return
    }
);

/////// Helpers ////////


function setProfession (context, page) {
	var _id = context.params._id;
	Session.set("profession", Professions.findOne(_id));
};


function authorizeAdmin (context, page) {
    if (Session.get("admin") === false) {
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
    '/professions/admin': { to: 'admin_index', before: authorizeAdmin },
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
   
    'click .editable': function (event) { 
        var target = event.target.id || window.event.srcElement.id //IE
        if (isAdmin)
            { Session.set("editing", target);  console.log("edit " + target); }
        },
   'focus .edit': function (event, template) { 
        var target = event.target.id || window.event.srcElement.id //IE
        document.getElementById(target).select(); 
        },
   'blur .edit': function (event, template) {
        var target = event.target.id || window.event.srcElement.id //IE
        var val = document.getElementById(target).value;
        var options = {};
        options[target] = val;
        Meteor.call('updateProfession', Session.get("profession"), options, function (error) {
                if (! error) { console.log("Profession updated."); }
            }); 
        Session.set("editing");
        }

});

Template.inspire.editing = function (field) {
    if (isAdmin)
        { return Session.equals("editing", field); }   
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