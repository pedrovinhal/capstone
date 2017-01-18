'use strict';
angular.module('capstone', ['ui.router', 'ngDialog'])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
    $stateProvider
        .state('app', {
           url:'/teams',
           views: {
               'content': {
                   templateUrl: 'views/team/teams.html',
                   controller: 'TeamsCtrl'
               }
           }
        })
        .state('app.team_dashboard', {
           url:'/:name/dashboard',
           views: {
               'content@': {
                   templateUrl: 'views/team/dashboard.html',
                   controller: 'TeamDashboardCtrl'
               }
           }
        })
        .state('app.team_students', {
           url:'/:name/students',
           views: {
               'content@': {
                   templateUrl: 'views/team/students.html',
                   controller: 'TeamStudentsCtrl'
               }
           }
        })
        .state('app.team_lessons', {
           url:'/:name/lessons',
           views: {
               'content@': {
                   templateUrl: 'views/team/lessons.html',
                   controller: 'TeamLessonsCtrl'
               }
           }
        })
        // ?? refactoring state + service + route
        .state('app.single_lesson', {
           url:'/:name/single_lesson/:id',
           views: {
               'content@': {
                   templateUrl: 'views/lesson/lesson.html',
                   controller: 'TeamLessonCtrl'
               }
           }
        })
        .state('app.student_dashboard', {
           url:'/student/:id/dashboard',
           views: {
               'content@': {
                   templateUrl: 'views/student/dashboard.html',
                   controller: 'StudentDashboardCtrl'
               }
           }
        })
        .state('app.reset', {
           url:'/reset',
           views: {
               'content@': {
                   templateUrl: 'views/reset/reset.html',
                   controller: 'ResetCtrl'
               }
           }
        });
    
    $urlRouterProvider.otherwise('/teams');
}])



;