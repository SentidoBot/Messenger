'use strict';


require('dotenv').load();
module.exports = grunt => {

    grunt.initConfig({
        jshint: {
            options: {
                jshintrc: true
            },
            sentido: ['.']
        },
        jscs: {
            src: '.',
            options: {
                config: '.jscs',
                fix: true
            }
        },
        nodemon: {
            dev: {
                script: 'app/index.js',
                options: {
                    args: ['--trace-sync-io'],
                    callback: nodemon => nodemon.on('log', event => console.log(event.colour)),
                    env: {
                        NODE_ENV: grunt.option('env') || 'local',
                        PORT: process.env.PORT
                    },
                    cwd: __dirname,
                    ignore: ['node_modules/**'],
                    ext: 'js',
                    delay: 500
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-jscs');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('hint', 'Hinting...', ['jshint:sentido', 'jscs']);
};
