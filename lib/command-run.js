'use strict';

const fs                    = require('fs');
const path                  = require('path');
const recursiveRead         = require('recursive-readdir');

module.exports = (configLocation) => {
    fs.readFile(path.join(process.cwd(), configLocation), 'utf-8', readConfig);

    function readConfig(err, data) {
        const config = JSON.parse(data);

        config.series.forEach(function(seriesElement) {
            recursiveRead(seriesElement.location, function(err, files) {
                readRecursively(err, files, seriesElement);
            });
        });

        function readRecursively(err, files, seriesElement) {
            var tempFileNames = [];
            var movieFileNames = [];

            files.forEach(function(file) {

                if (movie(file)) {
                    movieFileNames.push(file);
                } else if (temp(file)) {
                    tempFileNames.push(file);
                }
            });
            cleanUpTempFiles(tempFileNames);
            movieFileNames.forEach(function(movieFileName) {
                const fs                = require('fs');
                const tempFileName      = movieFileName + '.tmp';

                try {
                    fs.linkSync(movieFileName, tempFileName);
                }
                catch(err) {
                    //ignoring error, part of the normal flow that the tmp file is already exists.
                }

                try {
                    fs.unlinkSync(movieFileName);
                    fs.linkSync(tempFileName, movieFileName);
                    fs.unlinkSync(tempFileName);
                }
                catch(err) {
                    const logFile = path.join(config.trackingLocation, seriesElement.name + '.log');

                    if (!fs.existsSync(logFile)) {
                        fs.writeFileSync(logFile, movieFileName + ' is being opened.\n');
                    } else {
                        fs.appendFileSync(logFile, movieFileName + ' is being opened.\n');
                    }
                }

            });
        }
    }

    function cleanUpTempFiles(tempFileNames) {
        tempFileNames.forEach(function (tempFileName) {
            try {
                fs.unlinkSync(tempFileName);
            }
            catch (err) {
            }
        });
    }

    function movie(file) {
        const fileExtension = path.extname(file);
        return fileExtension === '.avi' || fileExtension === '.mp4';
    }

    function temp(file) {
        const fileExtension = path.extname(file);
        return fileExtension === '.tmp';
    }
};
