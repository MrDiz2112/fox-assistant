import "dotenv/config";
import logger from "./core/logger";
import { initI18n } from "./core/i18nInit";
import TelegramBot from "./services/TelegramBot";

initI18n();

logger.info("Bot launched");

const bot = new TelegramBot();

bot.launch();
