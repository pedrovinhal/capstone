var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

var Team      = require('./models/team'),
    Subject   = require('./models/subject'),
    Sum       = require('./models/sum'),
    Student   = require('./models/student'),
    Lesson   = require('./models/lesson'),
    Attendance   = require('./models/attendance'),
    Report   = require('./models/report');

/*var teams = ['1_AV', '2_AV', '1_FT', '2_FT', '1_CM', '2_CM'];*/
var teams = [{name:'1_AV', order:0}, {name:'2_CM', order:1}, {name:'3_FT', order:2}];
/*var subjects = ['POR', 'ING', 'TIC', 'FIS', 'CEV', 'MAT', 'HAT', 'ORG', 'NEV', 'DTS', 'AGR'];*/
var subjects = ['POR', 'ING', 'TIC', 'FIS', 'CEV', 'MAT'];
var hours = ['08h30', '09h15', '10h00', '10h45', '11h30', '12h15'];
var students = [
    {
        name: 'Amish Lin', 
        number:1
    },
    {
        name: 'Barbara Keen',
        number: 2
    },
    {
        name: 'John Doe', 
        number: 3
    },
    {
        name: 'Marie Amber', 
        number: 4
    }
];

function seedDB() {
    
    Team.remove({}).exec();
    Subject.remove({}).exec();
    Sum.remove({}).exec();
    Student.remove({}).exec();
    Lesson.remove({}).exec();
    Attendance.remove({}).exec();
    Report.remove({}).exec();
    
    // create Teams from array
    teams.forEach(function(team) {
        Team.create({name: team.name, order: team.order}, function(err, team) {
            if(err) console.log('err: ' + err);
            
            else {
                console.log('done: ' + team.name);
            }
        });
    });
    
    var addSubject = function(team) {
        subjects.forEach(function(subject) {
            
            // create Subject
            var promiseSubject = Subject.create({name: subject});
            promiseSubject
                .then(function(newSubject) {
                    console.log('New Subject created!!');
                    return newSubject;
                })
                
                // add each Subject to Team
                .then(function(newSubject) {
                    var obj = {
                        subject: newSubject._id,
                    };
                    
                    Team.findOne({name: team}, function(err, team) {
                        if(err) console.log(err);
                        
                        else {
                            team.subjects.push(obj);
                            team.save();
                            console.log('Subject saved');
                        }
                    });
                })
                
                .catch(function(err) {
                    console.log('err: ' + err);
                });
        });
    };
    
    // for each Team, add Subjects
    setTimeout(function() {
        teams.forEach(function(team) {
            addSubject(team.name);
        });
    }, 500);
    
    
    // create new Students from "students" array
    var createStudent = function(student, team){
        var promiseStudent = Student.create(student);
        promiseStudent
            .then(function(newStudent) {
                console.log('new Student created!!');
                return newStudent;
            })
            
            .then(function(newStudent) {
                // push Student to Team
                Team.findOne({name: team}, function(err, team) {
                    if(err) console.log(err);
                    
                    else {
                        newStudent.team.id = team._id;
                        newStudent.team.name = team.name;
                        newStudent.save();
                        
                        team.students.push(newStudent);
                        team.save();
                        console.log('Student pushed!!');
                        
                        // push each Subject from Team, to Student and add reportSums and totalSums
                        team.subjects.forEach(function(subject) {
                            var obj = {};
                            
                            Sum.create({AB: 0, LA: 0, MA: 0, BH: 0, SR: 0}, function(err, sum) {
                                if(err) console.log(err);
                                
                                else {
                                    console.log('Sum created!');
                                    
                                    obj = {
                                        subject: subject.subject,
                                        reportSums: sum
                                    };
                                    
                                    Student.findById(newStudent._id, function(err, foundedStudent) {
                                        if(err) console.log(err);
                                        
                                        else {
                                            foundedStudent.subjects.push(obj);
                                            
                                            Sum.create({AB: 0, LA: 0, MA: 0, BH: 0, SR: 0}, function(err, sum) {
                                                if(err) console.log(err);
                                                
                                                else {
                                                    console.log('Sum created!');
                                                    foundedStudent.totalSums = sum._id;
                                                    foundedStudent.save();
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                            
                            /*Student.findById(newStudent._id, function(err, foundedStudent) {
                                if(err) console.log(err);
                                
                                else {
                                    foundedStudent.subjects.push(obj);
                                    
                                    Sum.create({AB: 0, LA: 0, MA: 0, BH: 0, SR: 0}, function(err, sum) {
                                        if(err) console.log(err);
                                        
                                        else {
                                            console.log('Sum created!');
                                            foundedStudent.totalSums = sum._id;
                                            foundedStudent.save();
                                        }
                                    });
                                }
                            });*/
                        });
                    }
                });
            })
            
            .catch(function(err) {
                console.log('err: ' + err);
            });
    };
    
    setTimeout(function() {
        students.forEach(function(student) {
            teams.forEach(function(team) {
                createStudent(student, team.name);
            });
        });
    }, 2500);
    
    
    var createLesson = function(team, hour, subject, order) {
        var promiseL = Team.findOne({name: team});
        promiseL
            .then(function(foundedTeam) {
                return foundedTeam;
            })
            
            .then(function(foundedTeam) {
                Subject.findById({_id: foundedTeam.subjects[subject].subject}, function(err, subject) {
                    if(err) console.log(err);
                    
                    else {
                        console.log(subject.name);
        
                        // create Lesson
                        var promiseLesson = Lesson.create({team: team, hour: hour, order: order});
                        promiseLesson
                            .then(function(newLesson) {
                                console.log('Lesson created!!');
                                // save Team on Lesson
                                newLesson.team.id = foundedTeam._id;
                                newLesson.team.name = foundedTeam.name;
                                
                                // save Subject on Lesson
                                newLesson.subject.id = subject._id;
                                newLesson.subject.name = subject.name;
                                newLesson.save();
                                
                                //save Lesson on Subject
                                subject.lessons.push(newLesson);
                                subject.save();
                                
                                return newLesson._id;
                            })
                            
                            // find Team
                            .then(function(newLessonId) {
                                Team.findOne({name: team}).populate('students').exec(function(err, team) {
                                    if(err) console.log(err);
                                    
                                    else {
                                        
                                        // for each student, create Attendance and push to Lesson
                                        team.students.forEach(function(student) {
                                            Attendance.create({}, function(err, attendance) {
                                                if(err) console.log(err);
                                                
                                                else{
                                                    console.log('Attendance created!!');
                                                    attendance.student.id = student._id;
                                                    attendance.student.name = student.name;
                                                    attendance.save();
                                                    
                                                    Lesson.findById({_id: newLessonId}, function(err, lesson) {
                                                        if(err) console.log(err);
                                                        
                                                        else {
                                                            lesson.attendances.push(attendance);
                                                            lesson.save();
                                                        }
                                                    });
                                                }
                                            });
                                            console.log('student: ' + student.name);
                                        });
                                    }
                                });
                            });
                    }
                });
            })
            
            .catch(function(err) {
                console.log('err: ' + err);
            });
    };
    
    setTimeout(function() {
        teams.forEach(function(team) {
            for(var i = 0; i < subjects.length; i++) {
                createLesson(team.name, hours[i], i, i);
            }
        });
    }, 3500);
};

module.exports = seedDB;