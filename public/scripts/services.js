'use strict';
angular.module('capstone')

.service('teamsServ', ['$http', function($http) {
    this.getTeams = function() {
        return $http.get('/teams');
    };
    
    this.getTeam = function(name) {
        return $http.get('teams/' + name + '/dashboard');
    };
    
    this.getStudents = function(name) {
        return $http.get('teams/' + name + '/students');
    };
    
    this.getlessons = function(name) {
        return $http.get('teams/' + name + '/lessons');
    };
    
    /*this.getLesson = function(name) {
        return $http.get('teams/' + name + '/new_lesson');
    };*/
    
    this.getLesson = function(name, id) {
        return $http.get('teams/' + name + '/single_lesson/' + id);
    };
}])

.service('studentServ', ['$http', function($http) {
    this.getStudent = function(id) {
        return $http.get('students/' + id);
    };
}])

.service('lessonServ', ['$http', function($http) {
    this.getLessons = function() {
        return $http.get('/lessons');
    };
    
    this.putLesson = function(id, data) {
        return $http.put('/lessons/' + id, data)
            .then(function(response) {
                    console.log(response.data);
                },
                function(data, status) {
                    if(data.status === 401) {
                        console.log('send to login');
                    }
                }
            );
    };
}])

.service('attendanceServ', ['$http', function($http) {
    this.putAttendance = function(id, data) {
        return $http.put('/attendances/' + id, data);
    };
}])

.service('reportServ', ['$http', function($http) {
    this.postReport = function(data) {
        return $http.post('/reports', data);
            /*.then(function(response) {
                    console.log(response.data);
                },
                function(data, status) {
                    if(data.status === 401) {
                        console.log('send to login');
                    }
                }
            );*/
    };
    
    /*this.postLessonReports = function(data) {
        return $http.post('/reports/lesson', data)
            .then(function(response) {
                    console.log(response.data);
                },
                function(data, status) {
                    if(data.status === 401) {
                        console.log('send to login');
                    }
                }
            );
    };*/
}])

.service('resetServ', ['$http', function($http) {
    this.resetData = function() {
        return $http.get('/reset')
        .then(function(response) {
                console.log(response.data);
            },
            function(data, status) {
                if(data.status === 401) {
                    console.log('send to login');
                }
            }
        );
    };
}])

;