import i18next from "i18next";
import Backend, { FsBackendOptions } from "i18next-fs-backend";
import Logger from "./Logger";

const logger = Logger.getLogger("i18nInit");

function initI18n() {
    i18next.use(Backend).init<FsBackendOptions>(
        {
            initImmediate: false,
            lng: "ru",
            fallbackLng: "ru",
            preload: ["ru"],
            defaultNS: "translation",
            backend: {
                loadPath: "locales/{{lng}}.json",
            },
        },
        (error) => {
            if (error) {
                return logger.error(error);
            }

            logger.info("i18next is ready");
        }
    );
}

export { initI18n };
