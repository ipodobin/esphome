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
	db.all(query, function(err, rows){
		if(err) {
			console.log(err);
		} else if(rows != null) {
			rows.forEach(function(element, index, array) {
				console.log(element);
				element.register_date = date_format(new Date(element.register_date), 'yyyy-mm-dd hh:MM:ss');
				sensors.push(element);
			});
			// query = db.prepare('INSERT INTO logs (chip_id, type, date) VALUES (?, ?, ?);');
			// query.run(req.query.chip_id, 'ping', new Date());
			// query.finalize();
			// res.send('already in database');
		}
	});
	res.render('sensors.html', { 
		sensors: sensors
	});
});
// register sensor
router.put('/api/sensors', function(req, res) {
	var db = req.db;
	if(!req.query.chip_id) {
		res.send('no chip_id');
		return;
	}
	// sprawdzenie czy sensor jest w bazie danych
	var query = 'SELECT * FROM sensors WHERE chip_id=' + req.query.chip_id + ';';
	db.get(query, function(err, row){
		if(err) {
			res.send(err.message);
		} else if(row != null) {
			query = db.prepare('INSERT INTO logs (chip_id, type, date) VALUES (?, ?, ?);');
			query.run(req.query.chip_id, 'ping', new Date());
			query.finalize();
			res.send('already in database');
		} else {
			query = db.prepare('INSERT INTO sensors (chip_id, type, register_date) VALUES (?, ?, ?);');
			query.run(req.query.chip_id, req.query.type ? req.query.type : 1, new Date());
			query.finalize();
			res.send('added sensor: chip_id=' + req.query.chip_id);
		}
	});
});
router.get('/api/sensors', function(req, res) {
});
router.post('/api/sensors', function(req, res) {
});

module.exports = router;
	//font: 150px 'Italiana', sans-serif;	