'use strict';

const fs            = require('fs');
const path          = require('path');
const recursive     = require('recursive-readdir');

module.exports = (configLocation) => {
    const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), configLocation), 'utf-8'));

    config.series.forEach(function(seriesElement) {
        const fileNames = getFileNamesFor(seriesElement);
        console.log(fileNames);
    });

    function getFileNamesFor(seriesElement) {
        var movieFileNames = [];

        recursive(seriesElement.location, function(err, files) {
            files.forEach(function(file) {
            
                if (movie(file)) {
                    movieFileNames.push(file);
                }
            });
        });
        return movieFileNames;
    }

    function movie(file) {
        return path.extname(file) === '.avi';
    }
};