import "dotenv/config";
import { initI18n } from "./core/i18nInit";
import BotManager from "./services/BotManager";

initI18n();

const botsManager = new BotManager();

botsManager.handleBotsEvents();
botsManager.launchBots();
