import winston, { format } from "winston";

export default class Logger {
    public static getLogger(label: string): winston.Logger {
        return winston.createLogger({
            level: "info",
            format: format.combine(
                format.label({ label }),
                format.timestamp(),
                format.printf(({ level, message, label, timestamp }) => {
                    return `${timestamp} [${label}] ${level}: ${message}`;
                })
            ),
            transports: [new winston.transports.Console()],
        });
    }
}
