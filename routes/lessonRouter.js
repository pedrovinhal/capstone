var express     = require('express'),
    mongoose   = require('mongoose'),
    bodyParser  = require('body-parser'),
    
    Lesson     = require('../models/lesson');
    
    
var lessonRouter = express.Router();
lessonRouter.use(bodyParser.json());

lessonRouter.route('/')
// GET all Lessons
.get(function(req, res, next) {
    Lesson.find({}, function(err, lessons) {
        if(err) return next(err);
        
        else {
            res.json(lessons);
        }
    });
});

lessonRouter.route('/:id')
// UPDATE Lesson "pristine" flag
.put(function(req, res, next) {
    Lesson.findByIdAndUpdate(req.params.id, {pristine: false}, function(err, lesson) {
        if(err) return next(err);
        
        else {
            res.send('ok from lessonRouter');
        }
    });
});


module.exports = lessonRouter;