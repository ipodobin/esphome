var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	// res.render('index', { title: 'Express' });
	res.render('index.html', { 
		title: 'Express 123',
		output: 'Output'
	});
});
// show sensors
router.get('/sensors', function(req, res, next) {
	var db = req.db;
	var sensors = new Array();
	var query = 'SELECT * FROM sensors ORDER BY chip_id ASC;';
	var date_format = require('dateformat');
	db.all(query, function(err, rows) {
		if(err) {
			console.log(err);
		} else if(rows != null) {
			rows.forEach(function(element, index, array) {
				element.register_date = date_format(new Date(element.register_date), 'yyyy-mm-dd hh:MM:ss');
				sensors.push(element);
			});
		}
	});
	res.render('sensors.html', { 
		sensors: sensors
	});
});
router.get('/sensors/:chip_id', function(req, res, next) {
	var db = req.db;
	var query = 'SELECT * FROM sensors WHERE chip_id=' + req.params.chip_id + ';';
	db.get(query, function(err, row) {
		if(err) {
			res.send(err.message);
		} else if(row != null) {
			var sensor = row;
			var http = require('http');
			var querystring = require('querystring');
			var index = 0;
			var data = {
				type: 'relay',
				index: index
			};
			data = querystring.stringify(data);
			var options = {
				host: row.ipaddress,
				port: 80,
				path: '/api?' + data,
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			};
			// var relays = new Array();
			var request = http.request(options, function(result) {
				var output = '';
				console.log(options.host + ':' + result.statusCode);
				result.setEncoding('utf8');
				result.on('data', function (chunk) {
					output += chunk;
				});
				result.on('end', function() {
					var obj = JSON.parse(output);
					var query = 'SELECT _index, name FROM relays WHERE chip_id=' + req.params.chip_id + ';';
					db.all(query, function(err, rows) {
						if(err) {
							res.send(err.message);
						} else if(rows != null) {				
							var relays = new Array();			
							rows.forEach(function(element, index, array) {
								var state = 0;
								for(var i = 0; i < obj.length; i++) {
									if(element._index == obj[i].index) {
										state = obj[i].val;
										break;
									}
								}
								var el = {
									index: element._index,
									name: element.name,
									state: state
								};
								relays.push(el);
							});
							res.render('sensor.html', {
								sensor: sensor,
								relays: relays
							});
						}
					});
				});
			});
			request.on('error', function(err) {
				console.log('error: ' + err.message);
				res.render('sensor.html', { 
					sensor: row,
					relays: new Array()
				});
			});
			request.end();
		}
	});
});
// register sensor
router.put('/api/sensors', function(req, res) {
	var db = req.db;
	var chip_id = req.body.chip_id;
	var type = req.body.type ? req.body.type : 1;
	var ipaddress = req.body.ip;
	var relays_number = req.body.relays;
	if(!chip_id) {
		res.send('no chip_id');
		return;
	}
	// sprawdzenie czy sensor jest w bazie danych
	var query = 'SELECT * FROM sensors WHERE chip_id=' + chip_id + ';';
	db.get(query, function(err, row) {
		if(err) {
			res.send(err.message);
		} else if(row != null) {
			query = db.prepare('INSERT INTO logs (chip_id, type, date) VALUES (?, ?, ?);');
			query.run(chip_id, 'ping', new Date());
			query.finalize();
			query = db.prepare('UPDATE sensors SET ipaddress=? WHERE chip_id=?;');
			query.run(ipaddress, chip_id);
			query.finalize();
			res.send('already in database');
		} else {
			query = db.prepare('INSERT INTO sensors (chip_id, type, register_date, ipaddress) VALUES (?, ?, ?, ?);');
			query.run(chip_id, type, new Date(), ipaddress);
			query.finalize();
			for(var i = 0; i < relays_number; i++) {				
				query = db.prepare('INSERT INTO relays (chip_id, _index) VALUES (?, ?);');
				query.run(chip_id, i);
				query.finalize();
			}
			res.send('added sensor: chip_id=' + chip_id);
		}
	});
});
router.get('/api/sensors', function(req, res) {
});
router.post('/api/relay', function(req, res) {
	var db = req.db;
	var chip_id = req.body.chip_id;
	var index = req.body.index;
	var name = req.body.name;
	if(!chip_id || !index || !name || name == '') {
		res.send({
			err: 'wrong params'
		});
		return;
	}
	// zmiana nazwy przełącznika dla indeksu i chip_id
	var query = db.prepare('UPDATE relays SET name=? WHERE chip_id=? AND _index=?;');
	query.run(name, chip_id, index);
	query.finalize();
	res.send({
		msg: 'name changed to ' + name
	});

});

module.exports = router;