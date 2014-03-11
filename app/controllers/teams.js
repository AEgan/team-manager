var mongoose = require('mongoose'),
  Team = mongoose.model('Team');
  Player = mongoose.model('Player');
  User = mongoose.model('User');
  Family = mongoose.model('Family');
  RosterSpot = mongoose.model('RosterSpot');
  Event = mongoose.model('Event');
  Coach = mongoose.model('Coach');

var mailer = require('../mailers/team_mailer.js');
var NewUserAdded = require('../mailers/new_added_user');
var ExistingPlayer = require('../mailers/existing_player');
var NewPlayer = require('../mailers/new_player');



exports.index = function(req, res){
  Team.find(function(err, teams){
    if(err) throw new Error(err);
    res.render('team/index', {
      teams: teams,
      user:req.user
    });
  });
};

exports.show = function(req, res){
	//remember to put the id of the team in the request data
  	Team.findById(req.params.id, function(err, team){
  		Coach.getUsersForTeam(team._id, function(err, coaches){

  			Event.getByTeamId(team._id, function(err, events){

  				RosterSpot.getPlayersForTeam(team._id, function(players){

					if(err) {
						throw new Error(err);
						//res.status(404).render('404');
					}else{
				    	res.render('team/show', {
				    	  team: team,
				    	  user:req.user,
				    	  events: events,
				    	  players: players,
				    	  coaches: coaches
				    	});		
					}

				});
			});
  		});

  	});
};

exports.edit = function(req, res){
	Team.findById(req.params.id, function(error, team){
		if(error) {
			throw new Error(error);
			//res.status(404).render('404');
		}else{
			res.render('team/edit', {
				team: team,
				user: req.user
			})
		}
	});
}

exports.new = function(req, res){
	res.render('team/new',{
		user: req.user
	});
}

exports.update = function(req, res){
	Team.findById(req.params.id, function(error, team){
		
		var oldTeam = JSON.parse(JSON.stringify( team ));

		team.name = req.body.name;
		team.sport = req.body.sport;

		team.save(function(err, team){
			if(err){
				res.render('team/edit', {
					team: oldTeam,
					message: err,
					user: req.user
				});
			}else{
				res.redirect('/teams/' + team._id);	
			}
		})
	})
};

exports.create = function(req, res){
	var newTeam = new Team({
		name: req.body.name,
		sport: req.body.sport
	});
	newTeam.save(function(err, team){
		if(err){
			res.render('team/new', {
				team: team,
				message: err,
				user: req.user
			});
		}else{

			var coach = new Coach({
				user_id: req.user._id,
				team_id: team._id
			});
			

			coach.save(function(err, coach){
				res.redirect('/teams/' + team._id);
			});


			// {
			//	team: team,
			//	message: "You have successfully created team " + team.name
			//}
		}

	});
};

exports.delete = function (req, res){
	Team.findById(req.params.id, function(error, team){
		//if team doesn't have any players associated with it, can delete



		//delete dependent roster spots/events/attendances?
	});
};





//roster stuff

exports.roster_fill = function(req, res){
  	Team.findById(req.params.id, function(err, team){
		if(err) {
			// throw new Error(err);
			res.redirect("/404");
		}else{
	    	res.render('team/roster_fill', {
	    	  team: team,
	    	  user: req.user
	    	});			
		}

  	});

};



exports.roster_create = function(req, res){
	//console.log(req.param('first_name')+ " "+ req.param("last_name")+" : "+ req.param("email"));
	//res.send();

	Team.findById(req.params.id, function(err, team){
		User.getByEmail(req.param('email'), function(err, usr){
			if(err) res.redirect("/404");


			if(usr){//user exists
				//find player by user and name
				var index = null;
				Family.getPlayersForUser(usr._id, function(players){
					//console.log(players);

					for(var ii=0; ii<players.length; ii++){
						//console.log(players[ii].first_name + " : "+ req.param("first_name"));
						if(players[ii].first_name == req.param('first_name')){
							index = ii;
						}
					}

					if(index != null){	//if it exists, link it to team
						var existing_player = players[index];

						var spot = new RosterSpot({
							player_id: existing_player._id,
							team_id: team._id
						});

						spot.save(function(err, roster_spot){	//roster spot created

						 	//email sent
						 	console.log("existing player");
							ExistingPlayer.sendMail(req.user, team, existing_player, usr, function(){
									res.redirect('teams/'+req.params.id);
							});

						});


					}else{		//if it don't, create it and link it to family and roster
						var new_player = new Player({
							first_name: req.param('first_name'),
							last_name: req.param('last_name')
						});

						new_player.save(function(err, player){	//new player created
							console.log(player);
							var fam = new Family({
								user_id: usr._id,
								player_id: player._id
							});

							fam.save(function(err, fam){	//new family created

								var spot = new RosterSpot({
									player_id: player._id,
									team_id: team._id
								});

								spot.save(function(err, roster_spot){	//roster spot created

									//email sent
									console.log("new player");
									NewPlayer.sendMail(req.user, team, player, usr, function(){
											res.redirect('teams/'+req.params.id);
									});								 

								});
							});
						});
					}
				});

			}else{	//user does not exist
				
				var random_password = User.generateRandomPassword();

				var new_user = new User({		//user's password needs to be sent to them
					email: req.param('email'),
					active: false,
					password: random_password,
					last_name: req.param('last_name')//assuming they have the same last name as the player
				});

				new_user.save(function(err, usr){	//new user created

					var new_player = new Player({
							first_name: req.param('first_name'),
							last_name: req.param('last_name')
						});

						new_player.save(function(err, player){	//new player created
							var fam = new Family({
								user_id: usr._id,
								player_id: player._id
							});

							fam.save(function(err, fam){	//new family created

								var spot = new RosterSpot({
									player_id: player._id,
									team_id: team._id
								});

								spot.save(function(err, roster_spot){	//roster spot created

									//email sent
									console.log("new user");
									NewUserAdded.sendMail(req.user, team, player, usr, random_password, function(){
											res.redirect('teams/'+req.params.id);
									});

								});
							});
						});

				});


			}//end else
		});
	});
};







