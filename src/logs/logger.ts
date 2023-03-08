import logConfig from './logconfig'

const logger = {
    error: (mess: any) => {
        logConfig.error(mess)
    },
    warn:  (mess: any) => {
        logConfig.warn(mess)
    },
    info: (mess: any) => {
        logConfig.info(mess)
    },
    http: (mess: any) => {
        logConfig.http(mess)
    },
    verbose: (mess: any) => {
        logConfig.verbose(mess)
    },
    debug: (mess: any) => {
        logConfig.debug(mess)
    },
    silly: (mess: any) => {
        logConfig.silly(mess)
    }
}

export {logger}
