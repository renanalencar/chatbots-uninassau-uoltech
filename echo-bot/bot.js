// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');

class EchoBot extends ActivityHandler {
    constructor() {
        super();
        // Acesse https://aka.ms/about-bot-ativity-message para saber mais sobre a mensagem e outros tipos de atividade.
        this.onMessage(async (context, next) => {
            const replyText = `Você disse: ${ context.activity.text }`;
            await context.sendActivity(MessageFactory.text(replyText, replyText));
            // Ao chamar next() você assegura que o próximo BotHandler é executado.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            const welcomeText = 'Olá e bem-vinde ao Echo Bot!';
            for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
                }
            }
            // Ao chamar next() você assegura que o próximo BotHandler é executado.
            await next();
        });
    }
}

module.exports.EchoBot = EchoBot;
