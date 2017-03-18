'use strict';

const fs = require('fs');
const path = require('path');
var cron = require('cron');
var net = require('net');

module.exports = (seriesConfig, min, sec) => {
    let cronJobTimer;
    if (min) {
        cronJobTimer = '0 */' + min + ' * * * *';
        console.log('repeating in every min : ' + min);
    } else if (sec) {
        cronJobTimer = '*/' + sec + ' * * * * *';
        console.log('repeating in every sec: ' + sec);
    } else {
        cronJobTimer = '*/5 * * * * *';
        console.log('repeating in every sec: 5');
    }

    var cronJob = cron.job(cronJobTimer, function () {

        let logFilePromise = new Promise(
                (resolve, reject) => {
                    fs.readFile('c:\\Users\\gabor\\logfile.html', 'utf-8', function (err, data) {
                        resolve({logFile: data})
                    });
                }
            ),
            seriesConfigPromise = new Promise(
                (resolve, reject) => {
                    fs.readFile(seriesConfig, 'utf-8', function (err, data) {
                        resolve({seriesConfig: data})
                    });
                }
            );

        Promise.all([logFilePromise, seriesConfigPromise]).then(fileArgs => {
            const files = Object.assign(fileArgs[0], fileArgs[1]);
            const seriesConfig = JSON.parse(files.seriesConfig);

            files.logFile.split(/\r\n|\r|\n/).forEach(function (logEntry) {
                if (logEntry.includes('successfully opened') && (logEntry.includes('.avi') || logEntry.includes('.mp4') || logEntry.includes('.mkv'))) {
                    seriesConfig.series.forEach(function (element) {
                        if (logEntry.includes(element.pattern)) {
                            const logFile = path.join(seriesConfig.trackingLocation, element.name);

                            if (!fs.existsSync(logFile)) {
                                fs.writeFileSync(logFile, '<html><body>' + logEntry + '</body></html>');
                            } else {
                                fs.appendFileSync(logFile, '<br>\n' + logEntry);
                            }
                            console.log(logEntry);
                        }
                    });
                }
                ;
            });

            fs.writeFile("c:\\Users\\gabor\\logfile.html", '', function () {
                console.log('VLC log file cleared.');
            });
        });
    });
    cronJob.start();

    var server = net.createServer(function (socket) {
        cronJob.stop();
        socket.write('Watcher job stopped\r\n');
        socket.pipe(socket);
    });

    server.listen(1337, '127.0.0.1');
};
