'use strict';

module.exports = (args) => {
    const argv      = require('minimist')(args, { alias: { h: 'help', v: 'version' }});
    const command   = (argv._ && argv._.length > 0) ? argv._[0] : 'start';
    const seriesConfig    = command && argv._.length > 1 ? argv._[1] : 'config/series-config.json';

    if (argv.help) {
        console.log([
            'Usage: watcher [command] [options]',
            '',
            'Commands:',
            '    start             start watching files',
            '    stop              stop watching files',
            '',
            'Options:',
            '    -h, --help      prints this text',
            '    -v, --version   prints the version',
            ''
        ].join('\n'));
    } else if (argv.version) {
        console.log('CLI version', require('../package').version);
    } else {
        switch (command) {
            case 'start':
                require('../lib/command-start')(seriesConfig);
                break;
            case 'stop':
                require('../lib/command-stop')();
                break;
            default:
                console.log('Unknown command');
        }
    }
};