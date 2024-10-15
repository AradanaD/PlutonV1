var mongoose = require('mongoose');
var Schema = mongoose.Schema;

testerSchema = new Schema( {
	name: String,
	customer: String,
	utility: String,
	comms: String,
	accType: String,
	orderType: String,
	platform: String,
	config: String,
	status: String,
	testedBy: String,
	rel: Number,
	reqDate: Date,
	submissionDate: Date,
	startDate: Date,
	endDate: Date,
	rolloverDate: Date,
	rolloverDays: Number,
	rolloverDaysH: Number,
	waitingDays: Number,
	waitingDaysH: Number,
	testingDays: Number,
	testingDaysH: Number,
	reportNo: String,
	reviewedBy: String,
	codeCompare: String,
	newFW: String,
	tBugs: Number,
	image: String,
	user_id: Schema.ObjectId,
	is_delete: { type: Boolean, default: false },
	date : { type : Date, default: Date.now }
}),

module.exports = mongoose.model('tester', testerSchema, 'products');
