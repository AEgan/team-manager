var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var User = mongoose.model('User');
var	ObjectId = Schema.ObjectId;
var	Player = mongoose.model('Player');
var	Team = mongoose.model('Team');
var	Event = mongoose.model('Event');
var	RosterSpot = mongoose.model('RosterSpot');
var	Carpool = mongoose.model('Carpool');


//get
//needs event_id in param
exports.show = function(req, res){
	Carpool.findById(req.params.id, function(err, carpool){
		User.findById(carpool.user_id, function(err, driver){
			Event.findById(carpool.event_id, function(err, event){
				Team.findById(event.team_id, function(err, team){

					var access=false;
					if(req.user){
						console.log(req.user._id)
						console.log(driver._id)
						if(req.user._id.equals(driver._id)){
							access=true;
						}
					}

					res.render('carpool/show', {
					  carpool: carpool,
				      event: event,
				      date: dateFormat(carpool.time),
				      time: timeFormat(carpool.time),
				      team: team,
				      driver: driver,
				      user:req.user,
				      access: access
				    });
				});
			})
		})

	})
};

//get
//needs event_id in param
exports.new = function(req, res){
	Event.findById(req.params.event_id, function(err, event){
		Team.findById(event.team_id, function(err, team){
			res.render('carpool/new', {
		      event: event,
		      date: dateFormat(event.date),
		      team: team,
		      user:req.user
		    });
		});
	})
};

//post
exports.create = function(req, res){

	Event.findById(req.param('event_id'), function(err, event){
		var hour = req.param('hour');
		if(req.param('time')=="pm"){ hour= +hour + 12; }
		if(req.param('time')=="am" && req.param('hour')==12){ hour = 0; }
		var date = new Date(event.date.getFullYear(), event.date.getMonth(), event.date.getDate(), hour, req.param('minute'));

		var newCarpool = new Carpool({
			user_id: req.param('user_id'),
			event_id: req.param('event_id'),
			location: req.param('location'),
			notes: req.param('notes'),
			time: date,
			size: req.param('size')
		});

		newCarpool.save(function(err, cp){
			res.redirect('/events/'+event._id)
		})

	})

};

//get
exports.edit = function(req, res){
	Carpool.findById(req.params.id, function(err, carpool){
		User.findById(carpool.user_id, function(err, driver){
			Event.findById(carpool.event_id, function(err, event){
				Team.findById(event.team_id, function(err, team){


					if(!req.user._id.equals(driver._id)){
						res.redirect('back');
					}

					var time = "AM";
					var hour = carpool.time.getHours();
					if(carpool.time.getHours()>=12){
						hour = carpool.time.getHours()-12;
						time="PM";
					}
					var minutes = carpool.time.getMinutes();
					if(minutes == 0){
						minutes = "00";
					}

					res.render('carpool/edit', {
					  carpool: carpool,
				      time: time,
				      hour: hour,
				      minutes: minutes,
				      user:req.user,
				      event: event,
				      date: dateFormat(carpool.time),
				      team: team
				    });
				})
			})
		})

	})
};

//post
exports.update = function(req, res){

		Carpool.findById(req.params.id, function(error, carpool){
			//breaking down the time input to  DATETIME format
			var hour = req.param('hour');
			if(req.param('time')=="pm"){ hour= +hour + 12; }
			if(req.param('time')=="am" && req.param('hour')==12){ hour = 0; }
			var date = new Date(carpool.time.getFullYear(), carpool.time.getMonth(), carpool.time.getMinutes(), hour, req.param('minute'));

  			if(!req.user._id.equals(carpool.user_id)){
  				//not authorized
  				res.redirect('/');
		  	}else{

				  		carpool.time = date;
						carpool.location = req.param('location');
						carpool.size = req.param('size');
						carpool.notes = req.param('notes');

						carpool.save(function(err, cp){
							if(err){
								console.log(err);
								res.redirect('/');
							}else{
								res.redirect('/carpools/' + cp._id);
							}
						})
			}

		});
};





//pass in user_id and event_id?
exports.deleteByIds = function (req, res){

}

exports.delete = function(req, res){	//post       //test
  //if(req.user._id == req.params.id){	//authorize
  	Carpool.findById(req.params.id, function(err, cp){
  		var event_id = cp.event_id;
	    Carpool.remove({_id: req.params.id}, function(error, carpool){
	    	if(error){
	    		console.log(error);
	    	}
	    	//redirect?
	      	res.redirect('/events/'+event_id);
	    });
      })

};


//helpers
var dateFormat = function(date) {
    var day = date.getDate();
    var month = date.getMonth()+1;
    var year = date.getFullYear();
    return month+"/"+day+"/"+year;
};

var timeFormat = function(date) {
    var time = "AM";
	var hour = date.getHours();
	if( date.getHours()>=12){
		if(date.getHours()>12){
			hour =  date.getHours()-12;
		}else{
			hour = 12;
		}

		time="PM";
	}

	var minutes = date.getMinutes();
	if(date.getMinutes() == 0){
		minutes = "00";
	}

	return hour+":"+minutes+" "+time;
};