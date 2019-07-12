import { transports, format, createLogger } from 'winston';
import Settings from '../Settings';

const { combine, timestamp, printf, align } = format;

const logger = createLogger({
    format: combine(
        timestamp(),
        align(),
        printf(info => `${info.timestamp} [${Settings.get('instance_name')}] ${info.level}: ${info.message}`),
    ),
    transports: [
        new transports.Console({
            level: Settings.get('environment') === 'production' ? 'error' : 'debug',
            handleExceptions: true,
        }),
    ],
});

export default logger;
