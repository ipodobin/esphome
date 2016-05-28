/**
 * DataController
 *
 * @description :: Server-side logic for managing data
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
module.exports = {
  add: function (req, res) {
    var chip_id = req.body.chip_id;
    if (!chip_id) {
      res.send('no chip_id');
      return;
    }
    var type = req.body.type;
    // sprawdzenie czy sensor jest w bazie danych
    Device.findOne({
      id: chip_id
    }).exec(function (err, device) {
      if (err) {
        console.log(err);
        return res.send(err);
      }
      // bez błędu, ale nie ma w bazie urządzenia o podanym id
      if (device != null) {
        // dodaj wpis do bazy danych
        var type = req.body.type;
        var val = req.body.val;
        var datapoint = {
          date: new Date(),
          value: req.body.val,
          device: chip_id,
          type: req.body.type
        };
        Datapoint.create(datapoint).exec(function (err, p) {
          if (err) {
            console.log(err);
            return res.send(err);
          }
          console.log('Created datapoint');
          return res.send('Created datapoint: ' + JSON.stringify(p));
        });
      } else {
        return res.send('Device ' + chip_id + ' does not exist.');
      }
    });
  }
};