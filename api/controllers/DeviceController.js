/**
 * DeviceController
 *
 * @description :: Server-side logic for managing devices
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var timeseries = require("timeseries-analysis");
module.exports = {
  index: function (req, res) {
    Device.find().exec(function (err, devices) {
      if (err) {
        return res.send(err);
      }
      // var date_format = require('dateformat');
      // element.register_date = date_format(new Date(element.register_date), 'yyyy-mm-dd hh:MM:ss');
      return res.view('devices', {
        devices: devices
      });
    });
  },
  register: function (req, res) {
    var chip_id = req.body.chip_id;
    if (!chip_id) {
      res.send('no chip_id');
      return;
    }
    // sprawdzenie czy sensor jest w bazie danych
    Device.findOne({
      id: chip_id
    }).exec(function (err, device) {
      if (err) {
        console.log(err);
        return res.send(err);
      }
      // bez błędu, ale nie ma w bazie urządzenia o podanym id
      if (device == null) {
        // dodaj wpis do bazy danych
        var type = req.body.type ? req.body.type : 1;
        var ipaddress = req.body.ip;
        var relays_number = req.body.relays;
        device = {
          id: chip_id,
          type: type,
          ipaddress: ipaddress
        };
        //console.log(device);
        Device.create(device).exec(function (err, dev) {
          console.log('Created device');
          // dodanie przełączników
          for (var i = 0; i < relays_number; i++) {
            var relay = {
              // id: 0,
              name: 'relay_' + i,
              device: dev.id
            };
            console.log(relay);
            Relay.create(relay).exec(function (err, rel) {
              if (err) {
                console.log(err);
              }
            });
          }
          return res.send('Created device: ' + JSON.stringify(dev));
        });
      } else {
        // aktualizacja?
        return res.send('device exists');
      }
    });
  },
  details: function (req, res) {
    var chip_id = req.param('id');
    if (!chip_id) {
      res.send('no chip_id');
      return;
    }
    // sprawdzenie czy sensor jest w bazie danych
    Device.findOne({
      id: chip_id
    }).populate('relays').populate('sensors').exec(function (err, device) {
      if (err) {
        console.log(err);
        return res.send(err);
      }
      // bez błędu, ale nie ma w bazie urządzenia o podanym id
      if (device == null) {
        return res.notFound({
          id: chip_id
        });
      } else {
        // dodanie danych z czujników
        var from = new Date();
        from.setDate(from.getDate() - 1);
        var data = {};
        Datapoint.find({
          device: chip_id,
          createdAt: {
            '>': from
          }
        }).exec(function (err, datapoints) {
          if (err) {
            console.log(err);
          } else {
            datapoints.forEach(function (el, index, array) {
              if (!data[el.type]) {
                data[el.type] = new Array();
              }
              var value = [el.createdAt, el.value];
              data[el.type].push(value);
            });
            Object.keys(data).forEach(function (key, index) {
              var original = data[key];
              var t = new timeseries.main(original);
              //var h = new timeseries.main(data.humidity);
              //var processed = t.ma().output();
              //var processed = t.dsp_itrend({
              //  alpha: 0.7
              //}).output();
              var processed = t.smoother({
                period: 10
              }).output();
              data[key] = new Array();
              data[key].push(original);
              data[key].push(processed);
            });
          }
          // wyświetl szczegóły urządzenia
          return res.view('device', {
            device: device,
            data: data
          });
        });
      }
    });
  }
};