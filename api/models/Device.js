/**
 * Device.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

 module.exports = {

 	attributes: {
 		id: {
 			type: 'integer',
 			primaryKey: true,
 			autoIncrement: true,
 			// required: true,
 			unique: true
 		},
 		//id: {
 		//	type: 'string',
 		//	primaryKey: true,
 		//	required: true,
 		//	unique: true,
 		//	size: 10
 		//},
 		ipaddress: {
 			type: 'string',
 			required: true,
 			size: 15
 		},
 		relays: {
 			collection: 'relay',
 			via: 'device'
 		},
 		sensors: {
 			collection: 'sensor',
 			via: 'device'
 		}
 	}
 };

