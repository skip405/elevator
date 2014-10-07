module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        sass: {
            dist:  {
                options: {
                    style: 'compressed'
                },
                files: {
                    'elevator.css': 'elevator.scss'
                }
            }
        },
        watch: {
            css: {
                files: ['*.scss', '*/*.scss'],
                tasks: ['sass'],
                options: {
                    livereload: true,
                    spawn: false,
                },
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            js: {
                files: ['*.js', '*/*.js'],
                options: {
                    livereload: true,
                    spawn: false,
                },
            },
            src: {
                files: ['*.html'],
                options: {
                    livereload: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['watch']);
};