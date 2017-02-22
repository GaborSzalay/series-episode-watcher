'use strict';

const fs                    = require('fs');
const path                  = require('path');
const recursiveRead         = require('recursive-readdir');
var cron                    = require('cron');
var net                     = require('net');

module.exports = (configLocation) => {

    var cronJob = cron.job('* */15 * * * *', function(){
        fs.readFile(path.join(process.cwd(), configLocation), 'utf-8', readConfig);

        function readConfig(err, data) {
            const config = JSON.parse(data);

            config.series.forEach(function(seriesElement) {
                recursiveRead(seriesElement.location, function(err, files) {
                    readRecursively(err, files, seriesElement);
                });
            });

            function readRecursively(err, files, seriesElement) {
                var tempFileNames = files.filter(temp);
                var movieFileNames = files.filter(movie);

                cleanUpTempFiles(tempFileNames);
                movieFileNames.forEach(function(movieFileName) {
                    const fs                = require('fs');
                    const readLastLines     = require('read-last-lines');
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
                            fs.writeFileSync(logFile, movieFileName + '\n');
                            console.info(movieFileName);
                        } else {
                            readLastLines.read(logFile, 1)
                                .then((lines) => {
                                    if (lines.trim() !== movieFileName) {
                                        fs.appendFileSync(logFile, movieFileName + '\n');
                                        console.info(movieFileName);
                                    }
                                });
                        }
                    }
                });
            }
        }

        console.info('Files checked');
    });
    cronJob.start();

    var server = net.createServer(function(socket) {
        cronJob.stop();
        socket.write('Watcher job stopped\r\n');
        socket.pipe(socket);
    });

    server.listen(1337, '127.0.0.1');

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
        return fileExtension === '.avi' || fileExtension === '.mp4' || fileExtension === '.mkv';
    }

    function temp(file) {
        return path.extname(file) === '.tmp';
    }
};
