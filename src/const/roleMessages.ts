import { ChatCompletionRequestMessage } from "openai";
import i18next from "i18next";

const TSUNDERE_ROLE_PRIVATE: ChatCompletionRequestMessage[] = [];
const TSUNDERE_ROLE_GROUP: ChatCompletionRequestMessage[] = [];

export const ASSISTANT_ROLE = [{ role: "system", content: `` }];

function updateTsundereRole() {
    TSUNDERE_ROLE_PRIVATE.length = 0;
    TSUNDERE_ROLE_GROUP.length = 0;

    TSUNDERE_ROLE_PRIVATE.push(
        {
            role: "system",
            content: i18next.t("tsundereRole.private"),
        },
        {
            role: "assistant",
            content: i18next.t("greeting.private"),
        }
    );

    TSUNDERE_ROLE_GROUP.push(
        {
            role: "system",
            content: i18next.t("tsundereRole.group"),
        },
        {
            role: "assistant",
            content: i18next.t("greeting.group"),
        }
    );
}

if (i18next.isInitialized) {
    updateTsundereRole();
}

i18next.on("loaded", () => {
    updateTsundereRole();
});

export { TSUNDERE_ROLE_PRIVATE, TSUNDERE_ROLE_GROUP };
