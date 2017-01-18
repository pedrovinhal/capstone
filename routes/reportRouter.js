var express     = require('express'),
    mongoose   = require('mongoose'),
    bodyParser  = require('body-parser'),
    async       = require('async'),
    
    Report       = require('../models/report'),
    Lesson       = require('../models/lesson'),
    Student      = require('../models/student'),
    Sum          = require('../models/sum'),
    Team         = require('../models/team');
    

mongoose.Promise = require('bluebird');

    
var reportRouter = express.Router();
reportRouter.use(bodyParser.json());


reportRouter.route('/')
// POST Report, Push and Add to Sums
.post(function(req, res, next) {
    console.log(req.body);
    
    var obj = {
        student: req.body.student,
        team: req.body.team,
        subject: req.body.subject,
        hour: req.body.hour,
        type: req.body.type,
        description: req.body.description
    };
    
    // FIND Sum and += 1 to "type" function
    var addSum = function(id, reportType) {
        Sum.findById(id, function(err, sum) {
            if(err) return next(err);
            
            else {
                sum[reportType] += 1;
                sum.save();
            }
        });
    };
    
    //CREATE Report
    var reportPromise = Report.create(obj);
    reportPromise
        .then(function(report) {
            console.log('Report created!!');
            return report;
        })
        
        .then(function(report) {
            // push Report to Lesson
            Lesson.findById(req.body.lessonId, function(err, lesson) {
                if(err) return next(err);
        
                else {
                    console.log('Lesson founded!');
                    lesson.reports.push(report);
                    lesson.save();
                }
            });
            
            // push Report to Student and +=1 to Sum
            Student.findById(req.body.studentId, function(err, student) {
                if(err) return next(err);
        
                else {
                    console.log('Student founded!');
                    student.reports.push(report);
                    
                    addSum(student.totalSums, report.type);
                    
                    // find Subject in Student and +=1 reportSums
                    for(var a = 0; a < student.subjects.length; a++) {
                        //console.log(student.subjects[a].subject);
                        if(student.subjects[a].subject == req.body.subjectId) {
                            
                            var reportId = student.subjects[a].reportSums;
                            console.log('Id: ' + reportId);
                            
                            addSum(reportId, report.type);
                            break;
                        }
                    }
                    student.save();
                }
            });
            
            return report;
        })
        
        .then(function(report) {
            // push Report to Team and +=1 to Sum 
            Team.findById(req.body.teamId, function(err, team) {
                if(err) return next(err);
        
                else {
                    console.log('Student founded!');
                    team.reports.push(report);
                    
                    team.totalSums[report.type] += 1;
                    
                    // find Subject in Team and +=1 reportSums
                    for(var a = 0; a < team.subjects.length; a++) {
                        //console.log(student.subjects[a].subject);
                        if(team.subjects[a].subject == req.body.subjectId) {
                            
                            var reportSum = team.subjects[a].reportSums;
                            console.log('Id: ' + reportSum);
                            
                            reportSum[report.type] += 1;
                            
                            break;
                        }
                    }
                    team.save();
                }
            });
            
            res.send('ok');
        })
        
        .catch(function(err) {
            console.log('err: ' + err);
        });
});

module.exports = reportRouter;