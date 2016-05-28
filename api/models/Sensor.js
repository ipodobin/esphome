/**
 * Sensor.js
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
 			unique: true
 		},
 		name: {
 			type: 'string'
 		},
 		type: {
 			type: 'string',
 			enum: ['temperature', 'humidity', 'pressure'],
 			required: true
 		} ,
 		device: {
 			model: 'device',
 			required: true
 		}  
 	}
 };

