module.exports.routes = {
  '/': {
    view: 'homepage'
  },
  'put /api/devices': 'DeviceController.register',
  'put /api/data': 'DataController.add',
  'get /devices/:id': {
    controller: 'DeviceController',
    action: 'details',
    skipAssets: true
  }
};