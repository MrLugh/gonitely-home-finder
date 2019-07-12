import 'reflect-metadata';
import App from './App';
import Settings from './Settings';

const port = Settings.get('port');

process.on('uncaughtException', function(error) {
    console.error('Uncaught ', error);
});

process.on('unhandledRejection', function(reason, p) {
    console.error('Uncaught ', reason, p);
});

App.boot()
    .then(() => {
        const server = App.server().listen(port, (error: any) => {
            return error
                ? console.error(error)
                : console.log(`Server is listening on port ${port}`);
        });

        server.setTimeout(180000);
    })
    .catch((e) => {
        console.error(e);
        process.exit(0);
    });
