Meteor.subscribe("professions");
Meteor.subscribe("masterpieces");

Deps.autorun( function () {
    Meteor.subscribe("userData");
    var userId = Meteor.userId();
    Session.set("userId", userId);
    var current_user = Meteor.user();
    Session.set("current_user", current_user);
    isAdmin = current_user && current_user.isAdmin;
    Session.set("admin", isAdmin);
    console.log(current_user);
    return
    }
);

/////// Helpers ////////

function authorizeAdmin (context, page) {
    var admin = Session.get("admin");
    if (admin === false) {
      context.redirect(Meteor.unauthorizedPath());
    }
};

function setProfile (context, page) {
    var _id = context.params._id;
    var profile = Meteor.users.findOne(_id);
    Session.set("profile", profile);
    var current_user = Session.get("current_user");
    var isOwner = (profile === current_user) ? true : false;
    Session.set("isOwner", isOwner); 
};

function setProfession (context, page) {
    var _id = context.params._id;
    Session.set("profession", Professions.findOne(_id));
};

function generateId () {
    return '_' + Math.random().toString(36).substr(2, 9);
};

Handlebars.registerHelper("navClassFor", function (nav, options) {
      return Meteor.router.navEquals(nav) ? "active" : "";
  });


////////////////////////////


/////// Router ////////

Meteor.pages({

	// Page values can be an object of options, a function or a template name string

    '/': { to: 'professionsIndex', as: 'root' },
    '/profile/:_id': { to: 'profile', as: 'user', before: setProfile },
    '/professions': { to: 'professionsIndex', as: 'professions' },
    '/professions/new': { to: 'profession_backend', as: 'new_profession', before: authorizeAdmin },
    '/professions/admin': { to: 'adminIndex', before: authorizeAdmin },
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


/////// Users ///////////////

Template.profile.helpers({
    user: function () { 
        return Session.get("profile");  
    } 
});

Template.profile.events({
   
    'click .editable': function (event) { 
        var target = event.target.id || window.event.srcElement.id //IE
        if (isOwner)
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
        Meteor.call('setUserData', Session.get("current_user"), options, function (error) {
                if (! error) { console.log("User data updated."); }
            }); 
        Session.set("editing");
        }

});

Template.user_info.editing = function (field) {
    if (isOwner)
        { return Session.equals("editing", field); }   
};


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
        var specs = Session.get('specs');

        if (title.length && description.length && video.length && image.length && material.length) {
            Meteor.call('publishProfession', {
                title: title,
                sponsor: sponsor,
                description: description,
                videoUrl: video,
                imgUrl: image,
                requirements: requirements,
                material: material,
                specs: specs
                }, function (error) {
                    if (! error) { console.log("New profession created."); Session.set('specs', {}); }
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

////////// ADMIN ////////////

Template.adminIndex.helpers({
    professions: function () { 
        return Professions.find();
        }
    });

Template.adminIndex.events({
    'click .delete': function () {
        Meteor.call('deleteProfession', this._id, function (error) { if (!error) { console.log("Profession deleted."); } });
    }
    });


////////////////////////////////////////////////////////


////// Masterpieces ////////////////////////////////////

////////// NEW /////////////
 
////////// specification /////////////
Template.new_specs.helpers({
    specs: function () {
        var id1 = generateId();
        var id2 = generateId();
        var specs = [{ _id: id1, name: "First specification.", description: "Insert description." }, { _id: id2, name: "Second specification.", description: "Insert description." }];
        return Session.get('specs') || Session.set('specs', specs) ;
        }
    });

Template.new_specs.events({
    'click .delete': function (event, template) {
        var target = event.target.id || window.event.srcElement.id //IE
        var specs = Session.get('specs') || [];
        if (isAdmin) {
            for (var i = 0; i < specs.length; ++i) {
                if (specs[i]._id == target) { specs.splice(i, 1) ; }
            };
        } ;
        Session.set('specs', specs);
    },
    'click .add': function () {
        var specs = Session.get('specs') || [{}];
        var id = generateId();
        specs.push({_id: id, name: 'Insert name.', description: 'Insert description.'});
        Session.set('specs', specs);
    }
});


Template.new_spec.spec = function () {
    return Session.get('specs');
};

////////// masterpiece /////////////

Template.masterpiece.helpers({
    specification: function () {
        var profession = Session.get('profession');
        var specs = profession['specs'] || [];
        return specs ;
    }
});

Template.masterpiece.events({
    'click .submit': function (event, template) {
        var profession = Session.get('profession');        
        var specs = profession['specs'];
        var masterpiece = {};
        var chapters = [];
        for (var i = 0; i < specs.length; ++i) {
            var spec = specs[i];
            var submission = template.find("#" + spec._id).value;
            spec['submission'] = submission;
            chapters.push(spec);
        };
        masterpiece['chapters'] = chapters;
        var userId = Session.get('userId') || Meteor.userId ();
        if (userId) {
            masterpiece['professionId'] = profession._id;
            Meteor.call('submitMasterpiece', masterpiece, function (error) {
                    if (! error) { 
                        console.log("Masterpiece submitted.");
                        }
                }
            );
        } 
    }
});


////////////////////////////////////////////////////////

