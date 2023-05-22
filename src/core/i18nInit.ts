import i18next from "i18next";
import Backend, { FsBackendOptions } from "i18next-fs-backend";
import logger from "./logger";

function initI18n() {
    i18next.use(Backend).init<FsBackendOptions>(
        {
            initImmediate: false,
            lng: "ru",
            fallbackLng: "ru",
            preload: ["ru"],
            defaultNS: "translation",
            backend: {
                loadPath: "locales/{{lng}}/{{ns}}.json",
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
