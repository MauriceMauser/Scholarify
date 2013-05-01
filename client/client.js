Meteor.subscribe("professions");
Meteor.subscribe("masterpieces");

Deps.autorun( function () {
    Meteor.subscribe("userData");
    Session.set("userId", Meteor.userId());
    Session.set("current_user", Meteor.user());
    var current_user = Meteor.user();
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
    Session.set("profile", Meteor.users.findOne(_id));
    var user = Meteor.user();
    var isOwner = ( _id == (user && user._id) ) ? true : false;
    Session.set("isOwner", isOwner); 
};

function setProfession (context, page) {
    var _id = context.params._id;
    Session.set("profession", Professions.findOne(_id));
};

function setMasterpiece (context, page) {
    var _id = context.params._id;
    Session.set("masterpiece", Masterpieces.findOne(_id));
};

function generateId () {
    return '_' + Math.random().toString(36).substr(2, 9);
};

Handlebars.registerHelper("navClassFor", function (nav, options) {
    return Meteor.router.navEquals(nav) ? "active" : "";
  });

Handlebars.registerHelper('newReviewLink', function(text, _id) {
  return new Handlebars.SafeString(
    "<a href='/masterpieces/" + _id + "/review'>" + text + "</a>"
  );
});

////////////////////////////


/////// Router ////////

Meteor.pages({

	// Page values can be an object of options, a function or a template name string

    '/': { to: 'professionsIndex', as: 'root' },
    '/profile/:_id': { to: 'profile', as: 'user', before: setProfile, nav: 'user_info' },
    '/professions': { to: 'professionsIndex', as: 'professions' },
    '/professions/new': { to: 'profession_backend', as: 'new_profession', before: authorizeAdmin },
    '/professions/admin': { to: 'adminIndex', before: authorizeAdmin },
    '/profession/:_id': { to: 'professionShow', as: 'profession', before: setProfession, nav: 'inspire' },
    '/profession/:_id/inspire': { to: 'professionShow', before: setProfession, nav: 'inspire' },
    '/profession/:_id/learn': { to: 'professionShow', before: setProfession, nav: 'learn' },
    '/profession/:_id/proof': { to: 'professionShow', before: setProfession, nav: 'proof' },
    '/profession/:_id/masterpieces': { to: 'masterpieceIndex', before: setProfession, as: 'masterpieces' },
    '/masterpieces/:_id/review': { to: 'new_review', before: setMasterpiece, as: 'newReview'},
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

Template.layout.events({
    'click .logout': function () {
        Meteor.logout();
    }
});


/////// Users ///////////////

Template.profile.helpers({
    user: function () { 
        return Session.get("profile");
    }
});

Template.user_info.events({
   'click .edit': function () {
        if (Session.get("isOwner"))
            {  return Session.set("editing", true) }
   }
});

Template.user_info.helpers({
    editing: function () {
        if (Session.get("isOwner"))
        { return Session.get("editing"); }   
    }
});

Template.show_profile.helpers({
    isOwner: function () {
        return Session.get("isOwner"); 
    }
});

Template.edit_profile.events({
    'click .save': function (event, template) {
        var name = template.find("#name").value;
        var location = template.find("#location").value;
        var education = template.find("#education").value;
        var experience = template.find("#experience").value;
        var imageUrl = template.find("#imageUrl").value || rootPath + "male_user.png";
        var options = { name: name,
                        location: location,
                        education: education,
                        experience: experience,
                        imageUrl: imageUrl };
        Meteor.call('updateProfile', options, function (error) {
                    if (! error) { console.log("Profile updated."); Session.set('editing'); }
                });
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

////////// SHOW /////////////

////////// my_masterpiece /////////////

Template.my_masterpieces.helpers({
    masterpieces: function () { 
        var owner = Meteor.user();
        var ownerId = owner && owner._id;
        return Masterpieces.find({owner: ownerId });
    }
});

Template.my_masterpiece.helpers({
    profession_title: function (professionId) {
        var professionId = professionId;
        var profession = Professions.findOne({_id: professionId});
        return profession && profession.title;
    }
});

////////// INDEX /////////////

Template.masterpieceIndex.helpers({
    profession: function () {
        return Session.get("profession");
    },
    masterpieces: function () {
        var profession = Session.get("profession");
        var professionId = profession && profession._id;
        return Masterpieces.find({professionId: professionId});
    }
});

////////////////////////////////////////////////////////

////// Reviews ////////////////////////////////////////

Template.new_review.helpers({
    chapters: function () {
        var masterpiece = Session.get("masterpiece");
        return masterpiece && masterpiece.chapters
    }
});

Template.new_review.events({
    /*'click .submit': function (event, template) {
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
    }*/
});

////////////////////////////////////////////////////////

