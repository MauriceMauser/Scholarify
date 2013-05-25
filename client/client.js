Meteor.subscribe("professions");
Meteor.subscribe("masterpieces");
Meteor.subscribe("reviews");

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
    var current_user = Meteor.user();
    var isAdmin = current_user && current_user.isAdmin;
    if (!isAdmin) {
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

function setMyProfile (context, page) {
    var userId = Meteor.userId();
    Session.set("profile", Meteor.user());
    Session.set("isOwner", true); 
};

function setProfession (context, page) {
    var _id = context.params._id;
    Session.set("profession", Professions.findOne(_id));
};

function setMasterpiece (context, page) {
    var _id = context.params._id;
    Session.set("masterpiece", Masterpieces.findOne(_id));
};

function setReview (context, page) {
    var _id = context.params._id;
    Session.set("review", Reviews.findOne(_id));
};

function generateId () {
    return '_' + Math.random().toString(36).substr(2, 9);
};

Handlebars.registerHelper("navClassFor", function (nav, options) {
    return Meteor.router.navEquals(nav) ? "active" : "";
  });

Handlebars.registerHelper('newReviewLink', function(text, _id) {
  return new Handlebars.SafeString(
    "<a href='/masterpieces/" + _id + "/review' class='btn btn-block btn-large btn-info'>" + text + "</a>"
  );
});

Handlebars.registerHelper('showReviewLink', function(text, _id) {
  return new Handlebars.SafeString(
    "<a href='/reviews/" + _id + "' class='btn btn-large btn-block btn-info' style='margin-top:25px;'>" + text + "</a>"
  );
});

Handlebars.registerHelper('masterpieceReviewsLink', function(text, _id) {
  return new Handlebars.SafeString(
    "<a href='/masterpieces/" + _id + "/reviews' class='btn btn-success btn-large' style='float:right; width:100%'>" + text + "</a>"
  );
});

Handlebars.registerHelper('masterpiecesLink', function(text, _id) {
  return new Handlebars.SafeString(
    "<a href='/profession/" + _id + "/masterpieces' class='btn btn-info btn-large btn-block' id='reviewBtn' style='margin-top:10px;'>" + text + "</a>"
  );
});

////////////////////////////


/////// Router ////////

Meteor.pages({

	// Page values can be an object of options, a function or a template name string

    '/': { to: 'welcome', as: 'root' },
    '/profile/:_id': { to: 'profile', as: 'user', before: setProfile, nav: 'user_info' },
    '/profile/:_id/my-masterpieces': { to: 'profile', as: 'myMasterpieces', before: setMyProfile, nav: 'my_masterpieces' },
    '/professions': { to: 'professionsIndex', as: 'professions' },
    '/professions/new': { to: 'profession_backend', as: 'new_profession', before: authorizeAdmin, nav: 'inspire_backend' },
    '/professions/admin': { to: 'adminIndex', as: 'admin', before: authorizeAdmin },
    '/profession/:_id': { to: 'professionShow', as: 'profession', before: setProfession, nav: 'inspire' },
    '/profession/:_id/inspire': { to: 'professionShow', before: setProfession, nav: 'inspire' },
    '/profession/:_id/learn': { to: 'professionShow', before: setProfession, nav: 'learn' },
    '/profession/:_id/proof': { to: 'professionShow', before: setProfession, nav: 'proof' },
    '/profession/:_id/masterpieces': { to: 'masterpieceIndex', before: setProfession, as: 'masterpieces' },
    '/masterpieces/:_id/reviews': { to: 'masterpieceReviews', before: setMasterpiece, as: 'masterpieceReviews'},
    '/masterpieces/:_id/review': { to: 'new_review', before: setMasterpiece, as: 'newReview'},
    '/reviews/:_id': { to: 'showReview', before: setReview, as: 'showReview' },
    '/about': { to: 'about', as: 'about' },
    '/contact': { to: 'contact', as: 'contact' },
    '/master-application': { to: 'masterApplication', as: 'masterApplication' },
    '/401': { to: 'unauthorized'},
    '*': 'notFound'
  }, {

    // optional options to pass to the PageRouter

    defaults: {
      layout: 'layout'
    }

});

////////////////////////////

Template.layout.helpers({
    isAdmin: function () {
        return Session && Session.get('admin');
    }
});

Template.layout.events({
    'click .logout': function () {
        Meteor.logout();
    }
});

/*Template.layout.rendered = function () { 
    (function (d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=487294791309701";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
};*/


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

//To-Do: DRY editing, replace isAdmin with isCreator {{> learn_backend}}
Template.inspire.editing = function (field) {
    if (isAdmin)
        { return Session.equals("editing", field); }   
};

Template.professionPin.truncated_description = function () {
    return this.description.substring(0,120);
};

Template.learn.helpers({
    materialHTML: function () {
        return new Handlebars.SafeString(this.material);
    },
    isCreator: function () {
        var profession = Session.get("profession");
        var creator = profession && profession.creator; 
        var userId = Meteor.userId();
        return creator === userId;
    }
});

/*Template.learn.events({
    'click .update': function (event, template) {
        var val = document.getElementById('redactor_content').value;
        var options = {};
        options['material'] = val;
        Meteor.call('updateProfession', Session.get("profession"), options, function (error) {
                if (! error) { console.log("Profession updated."); }
            }); 
        Session.set("editing");
    }
});*/

Template.proof.helpers({
    isCreator: function () {
        var profession = Session.get("profession");
        var creator = profession && profession.creator; 
        var userId = Meteor.userId();
        return creator === userId;
    }/*,
    editing: function (field) {
        return Session && Session.get("editing") && Session.equals("editing", field);
    }*/
});

/*Template.proof.events({
    'click .update': function (event, template) {
        Session.set("editing");
        return
    }
});*/


/////// EDIT ////////

Template.learn_backend.rendered = function () {
    (function () {
            $('#redactor_content').redactor({ fixed: true,  minHeight: 300 });
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
        /*var profession = Session && Session.get('profession');
        var id1 = generateId();
        var id2 = generateId();
        var specs = profession && profession['specs'] || [{ _id: id1, name: "First specification.", description: "Insert description." }, { _id: id2, name: "Second specification.", description: "Insert description." }];       
        return Session && Session.get('specs') || Session.set('specs', specs) ;*/
        return Session && Session.get("specs");
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
        var specs = Session.get('specs') || [];
        var id = generateId();
        if (id) { 
            specs.push({_id: id, name: '', description: ''});
            Session.set('specs', specs); 
        } 
    }
});

Template.new_spec.events({
    'focus .edit': function (event, template) { 
        var target = event.target.id || window.event.srcElement.id //IE
        document.getElementById(target).select(); 
        },    
    'blur .edit': function (event, template) {
        var specId = template.data._id
        var target = event.target.id || window.event.srcElement.id //IE
        var attr = target.substr(0, target.indexOf('_')); 
        var val = document.getElementById(target).value;
        var specs = Session && Session.get("specs") || [];
        var spec = { _id: specId, name: '', description: '' };
        if (isAdmin) {
            for (var i = 0; i < specs.length; ++i) {
                if (specs[i]._id == specId) { 
                    spec = specs[i];
                    spec[attr] = val;
                    spec['_id'] = specId;
                    specs[i] = spec;  
                }
            };
            Session.set("specs", specs);
        };
    }
});

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

////// NEW ////////////

Template.new_review.helpers({
    chapters: function () {
        var masterpiece = Session.get("masterpiece");
        return masterpiece && masterpiece.chapters;
    }
});

Template.new_review.events({
    'click .submit': function (event, template) {
        var userId = Meteor.userId ();
        var masterpiece = Session.get("masterpiece");
        var review = {};
        var chapters = masterpiece && masterpiece.chapters;
        var review_chapters = [];
        for (var i = 0; i < chapters.length; ++i) {
            var chapter = chapters[i];
            var qual_review = template.find("#" + chapter._id).value;
            var quant_review = $("#" + chapter._id + ".star").raty('score') || 0;
            chapter['review'] = qual_review;
            chapter['score'] = quant_review;
            review_chapters.push(chapter);
        };
        review['chapters'] = review_chapters;
        if (Meteor.user()) {
            review['masterpieceId'] = masterpiece._id;
            Meteor.call('submitReview', review, function (error) {
                    if (! error) { 
                        console.log("Review submitted.");
                        }
                }
            );
        } 
    }
});

Template.newChapterReview.rendered = function () { 
    $('.star').raty();
};


////// INDEX ////////////

Template.masterpieceReviews.helpers({
    masterpiece: function () {
        return Session.get("masterpiece");
    },
    reviews: function () {
        var masterpiece = Session.get("masterpiece");
        var masterpieceId = masterpiece && masterpiece._id;
        return Reviews.find({masterpieceId: masterpieceId});
    }
});

Template.my_reviews.helpers({
    reviews: function () {
        var userId = Meteor.userId();
        return Reviews.find({owner: userId});
    },
    masterpiece_title: function (masterpieceId) {
        var masterpiece = Masterpieces.findOne({_id: masterpieceId});
        var professionId = masterpiece.professionId;
        var profession = Professions.findOne({_id: professionId});
        return profession && profession.title;
    },
    professions: function () {
        return Professions.find();
    }
});

Template.my_reviews.events({
    'click #reviewBtn': function () {
        $('#reviewModal').modal('hide')
    }
});

////// SHOW ////////////

Template.showReview.helpers({
    review: function () {
        return Session.get("review");
    }
});


////////////////////////////////////////////////////////

///// MASTER APPLICATION ////////

Template.masterApplication.events({
    'click .apply': function (event, template) {
        var name = template.find("#applicant_name").value;
        var email = template.find("#applicant_mail").value;
        var qualifications = template.find("#applicant_qualifications").value;
        var project = template.find("#applicant_project").value;
        var mailer_text = "Name: " + name + "; Email: " + email + " Qualifications: " + qualifications + "; Project: " + project + ".";

        if (name.length && email.length && qualifications.length && project.length) {
            Meteor.call('createApplicant', {
                name: name,
                email: email,
                qualifications: qualifications,
                project: project,
                mailer_text: mailer_text
                }, function (error) {
                    if (! error) { console.log("New applicant."); }
                }
            );
        } else {
            Session.set("publishError", "An application requires a name, email, qualifications, and a project.");
        }
    }
});

/////////////////////////////////


