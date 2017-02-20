'use strict';

const fs                    = require('fs');
const path                  = require('path');
const recursiveReadSync     = require('recursive-readdir-sync');

module.exports = (configLocation) => {
    const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), configLocation), 'utf-8'));

    config.series.forEach(function(seriesElement) {
        const globalConfig = config;
        const files = recursiveReadSync(seriesElement.location);
        var tempFileNames = [];
        var movieFileNames = [];

        files.forEach(function(file) {
        
            if (movie(file)) {
                movieFileNames.push(file);
            } else if (temp(file)) {
                tempFileNames.push(file);
            }
        });

        tempFileNames.forEach(function(tempFileName) {
            try {
                fs.unlinkSync(tempFileName);
            }
            catch(err) {}
        });

        movieFileNames.forEach(function(movieFileName) {
            const fs                = require('fs');
            const config            = globalConfig;
            const tempFileName      = movieFileName + '.tmp';
            const _seriesElement    = seriesElement;
            
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
                const logFile = path.join(config.trackingLocation, _seriesElement.name + '.log');

                if (!fs.existsSync(logFile)) {
                    fs.writeFileSync(logFile, movieFileName + ' is being opened.\n');
                } else {
                    fs.appendFileSync(logFile, movieFileName + ' is being opened.\n');
                }
            }
            
        });
    });

    function movie(file) {
        const fileExtension = path.extname(file);

        return fileExtension === '.avi' || fileExtension === '.mp4';
    }

    function temp(file) {
        const fileExtension = path.extname(file);

        return fileExtension === '.tmp';
    }
};
