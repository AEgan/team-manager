module.exports = function(app){

	//home route
	var home = require('../app/controllers/home');
	var events = require('../app/controllers/events')
	var teams = require('../app/controllers/teams');
	var users = require('../app/controllers/users');
	var players = require('../app/controllers/players');
	var email_templates = require('../app/controllers/email_templates');
	var families = require('../app/controllers/families');
	var roster_spots = require('../app/controllers/roster_spots');
	var coaches = require('../app/controllers/coaches');
	var carpools = require('../app/controllers/carpools');
	var riders = require('../app/controllers/riders');

	var mail = require('../app/controllers/mail');
	var attendances = require('../app/controllers/attendances');

	//home stuff
	app.get('/', home.index);
	app.get('/404', home.err);


	//users
	app.get('/account', ensureAuthenticated, users.account);
	app.get('/users/:id', users.show)
	app.get('/register', users.registration);
	app.post('/register', users.register);
	app.get('/login', users.signin);
	app.post('/login', users.login);
	app.get('/logout', users.logout);
	app.post('/users/:id/delete', ensureAuthenticated, users.delete);
	app.get('/users/:id/edit', ensureAuthenticated, users.edit);
	app.post('/users/:id/edit', ensureAuthenticated, users.update);
	app.get('/forget', users.forget);
	app.post('/forget', users.remember);
	app.get('/users/:id/password-change', ensureAuthenticated, users.password_form);
	app.post('/users/:id/password-change', ensureAuthenticated, users.password_change);

	app.get('/users', users.index);	//to be removed in production

	// players
	app.get('/players', players.index);
	app.get('/players/new', ensureAuthenticated, players.new_player);
	app.post('/players/new', ensureAuthenticated, players.create_player);
	app.get('/players/:id', players.show);
	app.get('/players/:id/edit', ensureAuthenticated, players.edit);
	app.post('/players/:id/update', ensureAuthenticated, players.update);
	app.post('/players/:id/delete', ensureAuthenticated, players.delete);
	app.get('/players/:id/addUser', ensureAuthenticated, players.addUser);
	app.post('/players/:id/addUser', ensureAuthenticated, players.createNewFamily);

	//AJAX
	app.get('/players/:id/teams', players.teams);

	// teams
	app.get('/teams', teams.index);
	app.get('/teams/new', ensureAuthenticated, teams.new);
	app.post('/teams/new', ensureAuthenticated, teams.create);
	app.get('/teams/:id', teams.show);
	app.get('/teams/:id/edit', ensureAuthenticated, teams.edit);
	app.post('/teams/:id/edit', ensureAuthenticated, teams.update);
	//app.post('/teams/:id/delete', teams.delete);

	app.get('/teams/:id/event', ensureAuthenticated, events.team_event);
	app.get('/teams/:id/calendar', teams.calendar);
	app.get('/teams/:id/roster', ensureAuthenticated, teams.roster);	//further auth?????


	// events
	app.get('/events', events.index);	//tbd
	app.get('/events/:id', events.show);
	app.get('/events/new', ensureAuthenticated, events.new);
	app.post('/events/new', ensureAuthenticated, events.create);
	app.get('/events/:id/edit', ensureAuthenticated, events.edit);
	app.post('/events/:id/edit', ensureAuthenticated, events.update);
	app.post('/events/:id/delete', ensureAuthenticated, events.delete);
	app.get('/teams/:team_id/next_event', events.next_event);

	//attendance AJAX
	app.get('/events/:event_id/players/:player_id/attendance', events.attendance)

	// email AJAX
	app.get('/players/:player_id/:event_id/guardians', attendances.guardianResponse);

	// mailer
	app.get('/mail/compose', mail.compose_mail);	//authentication?
	app.post('/mail/test', mail.test);		//authentication?

	// email templates
	app.get('/teams/:id/templates/new', ensureAuthenticated, email_templates.new);	//authentication? only coaches?
	app.post('/teams/:id/templates/new', ensureAuthenticated, email_templates.create);
	app.get('/teams/:id/templates', ensureAuthenticated, email_templates.index);
	app.get('/teams/:id/templates/:temp_id', ensureAuthenticated, email_templates.show);
	app.post('/teams/:id/templates/:temp_id/delete', ensureAuthenticated, email_templates.delete);
	app.get('/teams/:id/templates/:temp_id/edit', ensureAuthenticated, email_templates.edit);
	app.post('/teams/:id/templates/:temp_id/update', ensureAuthenticated, email_templates.update);

	//filling the roster
	app.get('/teams/:id/roster-fill', ensureAuthenticated, teams.roster_fill);
	app.post('/teams/:id/roster-create', ensureAuthenticated, teams.roster_create);
	app.post('/teams/:team_id/players/:player_id/remove', ensureAuthenticated, roster_spots.deleteByIds);

	//coach
	app.post('/teams/:team_id/user/:user_id/remove', ensureAuthenticated, coaches.deleteByIds)

	//family
	app.post('/family/new',  ensureAuthenticated, families.new);	//tbd?
	app.post('/family/:id/delete',  ensureAuthenticated, families.delete);	//is this used in prod??
	app.get('/families', families.index);		//to be removed in production

	// attendance
	app.get('/attendance/:attendanceid/:response', attendances.record_response);
	app.get('/attendanceRemind/:event_id/:player_id', attendances.send_email);
	app.get('/attendanceUpdate/:event_id/:player_id/:response', attendances.web_update);
	app.post('/emailAll/:event_id', attendances.email_all);

	//carpools
	app.get('/events/:event_id/carpools/new', ensureAuthenticated, carpools.new);
	app.post('/carpools/new', ensureAuthenticated, carpools.create);
	app.get('/carpools/:id', carpools.show);

	app.get('/carpools/:id/edit', ensureAuthenticated, carpools.edit);
	app.post('/carpools/:id/edit', ensureAuthenticated, carpools.update);

	app.post('/carpools/:id/delete', ensureAuthenticated, carpools.delete);

	app.get('/riders', riders.index);



	//
	app.get('*', home.err);
};


//used to make sure the user is logged in to access a route
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}
