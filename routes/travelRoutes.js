var async = require('async');

module.exports = function(app, router, nohm, UserModel, userCalendar, userMap, uber, calendar, googleAuth, credentials) {

  /**
   * Returns all Google Directions API routes and Uber time and prices estimates to the client via JSON.
   * Request needs at least origin and destination parameters, which much be addresses or long/lat coordinates.
   * Request body can also include a departure or arrival time (only applied to 'transit' route modes) - in # seconds
   * since epoch time
   */
  router.post('/routes', function(req, res) {
    var origin = req.body.origin;
    var destination = req.body.destination;
    var arrivalTime = req.body.arrivalTime;
    var departureTime = req.body.departureTime;

    async.parallel({
      directions: function(cb) {
        userMap.getAllRoutes(origin, destination, arrivalTime, departureTime, function(data) {
          // console.log('Routes:', routes);
          cb(null, data);
        });
      },

      uber: function(cb) {
        uber.getEstimates(origin, destination, credentials, function(estimates) {
          // console.log('Estimates:', estimates);
          cb(null, estimates);
        });
      }
    },

    function(err, results) {
      if (err) {
        console.log('Error in routes api', err);
        res.status(400);
        res.end();
      } else {
        console.log('Sending back routes')
        res.status(200);
        results.misc = {};
        results.misc.origin = origin;
        results.misc.destination = {
          longitude: destination.longitude,
          latitude: destination.latitude,
          address: req.body.destAddress
        };
        res.json(results);
      }
    });
  });
};
