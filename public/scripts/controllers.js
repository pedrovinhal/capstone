'use strict';
angular.module('capstone')

// use demo foto when student don't have one
.filter('defaultUser', function() {
    return function(input, param) {
        if(!input) {
            return param;
        }
        return input;
    };
})

.controller('TeamsCtrl', ['$scope', 'teamsServ', function($scope, teamsServ) {
    $scope.teams = [];
    var refresh = function() {
        teamsServ.getTeams()
            .then(
                function(response) {
                    console.log(response.data);
                    $scope.teams = response.data;
                },
                function(data, status) {
                    if(data.status === 401) {
                        console.log('send to login');
                    }
                }
            );
    };
    refresh();
}])

.controller('TeamDashboardCtrl', ['$scope', '$stateParams', 'teamsServ', function($scope, $stateParams, teamsServ) {
    $scope.team = {};
    var refresh = function() {
        teamsServ.getTeam($stateParams.name)
            .then(function(response) {
                console.log(response.data);
                $scope.team = response.data;
            },
            function(data, status) {
                if(data.status === 401) {
                    console.log('send to login');
                }
            }
        );
    };
    refresh();
    
    $scope.filterFn = function() {
        $scope.showFilter = !$scope.showFilter;
        $scope.subjectFilter = '';
        $scope.studentFilter = '';
        $scope.typeFilter = '';
    };
}])

.controller('TeamStudentsCtrl', ['$scope', '$stateParams', 'teamsServ', function($scope, $stateParams, teamsServ) {
    $scope.team = {};
    $scope.students = [];
    var refresh = function() {
        teamsServ.getStudents($stateParams.name)
            .then(function(response) {
                console.log(response.data);
                $scope.team = response.data;
                $scope.students = response.data.students;
            },
            function(data, status) {
                if(data.status === 401) {
                    console.log('send to login');
                }
            }
        );
    };
    refresh();
}])

.controller('TeamLessonsCtrl', ['$scope', '$stateParams', 'teamsServ', function($scope, $stateParams, teamsServ) {
    $scope.lessons = [];
    var refresh = function() {
        teamsServ.getlessons($stateParams.name)
            .then(function(response) {
                console.log(response.data);
                $scope.lessons = response.data;
                countReports();
            },
            function(data, status) {
                if(data.status === 401) {
                    console.log('send to login');
                }
            }
        );
    };
    refresh();
    
    // for each lesson, count Report Types
    var countReports = function() {
        $scope.lessons.forEach(function(lesson) {
            var sums = {AB: 0, LA: 0, MA: 0, BH: 0, SR: 0};
            
            lesson.reports.forEach(function(report) {
                for(var prop in sums) {
                    console.log(report.type);
                    if(report.type == prop) {
                        sums[prop] += 1;
                    }
                }
            });
            
            lesson.sums = sums;
        });
    };
}])

.controller('TeamLessonCtrl', ['$scope', '$stateParams', '$state', 'ngDialog', 'teamsServ', 'attendanceServ', 'reportServ', 'lessonServ', function($scope, $stateParams, $state, ngDialog, teamsServ, attendanceServ, reportServ, lessonServ) {
    $scope.lesson = {};
    var refresh = function() {
        teamsServ.getLesson($stateParams.name, $stateParams.id)
            .then(function(response) {
                console.log(response.data);
                $scope.lesson = response.data;
            },
            function(data, status) {
                if(data.status === 401) {
                    console.log('send to login');
                }
            }
        );
    };
    refresh();
    
    $scope.saveFn = function() {
        var arrReports = [];
        var count = 0;
        
        $scope.lesson.attendances.forEach(function(attendance) {
            var obj = {
                present: attendance.present,
                late: attendance.late
            };
            
            attendanceServ.putAttendance(attendance._id, obj)
                .then(function(response) {
                    //console.log(response.data);
                },
                function(data, status) {
                    if(data.status === 401) {
                        console.log('send to login');
                    }
                }
            );
            
            // Report Obj to send in req.body
            var report = {
                student: attendance.student.name,
                studentId: attendance.student.id,
                team: $scope.lesson.team.name,
                teamId: $scope.lesson.team.id,
                lessonId: $scope.lesson._id,
                subject: $scope.lesson.subject.name,
                subjectId: $scope.lesson.subject.id,
                hour: $scope.lesson.hour,
                description: 'n/a'
            };
            
            // if Student !present or Late, push to Array
            if(obj.present === false) {
                report.type = 'AB';
                arrReports.push(report);
                
            } else if(obj.late === true) {
                report.type = 'LA';
                arrReports.push(report);
            }
        });
        
        // POST, for each Report in Array
        // "Recursive function" to resolve the Async problem
        var forEachReport = function() {
            reportServ.postReport(arrReports[count])
                .then(function(response) {
                        console.log(response.data);
                        count += 1;
                        
                        if(count < arrReports.length) {
                            return forEachReport();
                            
                        } else {
                            console.log('done');
                        }
                    },
                    function(data, status) {
                        if(data.status === 401) {
                            console.log('send to login');
                        }
                    }
                );
        };
        forEachReport();
        
        // Disable Save button
        $scope.lesson.pristine = false;
        var objPristine = {pristine: $scope.lesson.pristine};
        lessonServ.putLesson($scope.lesson._id, objPristine);
    };
    
    // if Late, then Present
    $scope.changePresent = function(attendance) {
        if(attendance.late) {
            attendance.present = true;
        }
    };
    
    // if !Present, then !Late
    $scope.changeLate = function(attendance) {
        if(!attendance.present) {
            attendance.late = false;
        }
    };
    
    // modal to Post report type "MA", "BH", "SR"
    $scope.openDialog = function(attendance, lesson) {
        console.log('studentId: ' + attendance.student.id);
        
        $scope.newReport = {
            student: attendance.student.name,
            studentId: attendance.student.id,
            team: lesson.team.name,
            teamId: lesson.team.id,
            lessonId: lesson._id,
            subject: lesson.subject.name,
            subjectId: lesson.subject.id,
            hour: lesson.hour
        };
        
        ngDialog.open({
            template: 'views/dialogs/newReport.html',
            className: 'ngdialog-theme-plain',
            scope: $scope,
            disableAnimation: true
        });
    };
    
    $scope.submitReport = function(report) {
        console.log(report);
        
        reportServ.postReport(report)
            .then(function(response) {
                    console.log(response.data);
                },
                function(data, status) {
                    if(data.status === 401) {
                        console.log('send to login');
                    }
                }
            );
        
        ngDialog.closeAll();
    };
}])

.controller('StudentDashboardCtrl', ['$scope', '$stateParams', 'studentServ', function($scope, $stateParams, studentServ) {
    $scope.student = {};
    var refresh = function() {
        studentServ.getStudent($stateParams.id)
            .then(function(response) {
                console.log(response.data);
                $scope.student = response.data;
            },
            function(data, status) {
                if(data.status === 401) {
                    console.log('send to login');
                }
            }
        );
    };
    refresh();
    
    $scope.filterFn = function() {
        $scope.showFilter = !$scope.showFilter;
        $scope.subjectFilter = '';
        $scope.studentFilter = '';
        $scope.typeFilter = '';
    };
}])

// Reset all Data
.controller('ResetCtrl', ['$scope', '$state', 'resetServ', function($scope, $state, resetServ) {
    $scope.reset = function() {
        resetServ.resetData();
        
        setTimeout(function() {
            $state.go('app');
        }, 2500);
    };
}])

;