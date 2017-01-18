var mongoose = require('mongoose');

var subjectSchema = new mongoose.Schema({
    /*team: String,*/
    name: String,
    lessons: [{type: mongoose.Schema.Types.ObjectId, ref: 'Lesson'}]
});

module.exports = mongoose.model('Subject', subjectSchema);