'use strict';

const fs            = require('fs');
const path          = require('path');
const recursive     = require('recursive-readdir');

module.exports = (configLocation) => {
    const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), configLocation), 'utf-8'));

    config.series.forEach(function(seriesElement) {
        recursive(seriesElement.location, function(err, files) {
            var movieFileNames = [];

            files.forEach(function(file) {
            
                if (movie(file)) {
                    movieFileNames.push(file);
                }
            });
            console.log(movieFileNames);
        });
    });

    function movie(file) {
        return path.extname(file) === '.avi';
    }
};