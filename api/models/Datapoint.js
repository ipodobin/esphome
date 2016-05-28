/**
 * Datapoint.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

 module.exports = {

 	attributes: {
 		date: {
 			type: 'date',
 			required: true
 		},
 		value: {
 			type: 'float',
 			required: true
 		},
 		device: {
 			model: 'device',
 			required: true
 		},
 		type: {
 			type: 'string',
 			enum: ['temperature', 'humidity', 'pressure'],
 			required: true
 		} 
 	}
 };

