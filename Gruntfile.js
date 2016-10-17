module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        sass: {
            dist: {
                options: {
                    style: 'compressed'
                },
                files: {
                    'library/styles/main.min.css': 'source/styles/main.scss'
                }
            }
        },

        uglify: {
            options: {
                preserveComments: false
            },
            my_target: {
                files: {
                    'library/js/main.min.js': ['source/js/main.js']
                }
            }
        },

        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['source/js/*.js'],
                dest: 'library/js/main.js'
            }
        },

        imagemin: {
            dynamic: {
                options: {
                    optimizationLevel: 3
                },
                files: [{
                    expand: true,
                    cwd: 'images/',
                    src: ['**/*.{png,jpg,gif,svg}'],
                    dest: 'images/'
                }]
            }
        },

        watch: {
            css: {
                files: ['source/styles/**/*'],
                tasks: ['sass']
            },

            javascript: {
                files: ['source/js/**/*'],
                tasks: ['concat', 'uglify']
            },

            img: {
                files: ['images/**/*'],
                tasks: ['imagemin']
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.registerTask('default', ['sass', 'watch', 'imagemin', 'concat', 'uglify']);
};
