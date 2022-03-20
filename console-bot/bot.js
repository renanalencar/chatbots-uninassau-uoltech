/**
 * Source : https://github.com/microsoft/BotBuilder-Samples/tree/main/samples/javascript_nodejs/01.console-echo
 * Arquivo: index.js
 * Data: 18/02/2018
 * Descrição: Classe que representa o Console Bot.
 * Autor: Renan Alencar
 *
 */

class ConsoleBot {
    async onTurn(context) {
        // Verifica se esta activity é uma mensagem de entrada.
        // (Teoricamente poderia ser um outro tipo de activity.)
        if (context.activity.type === 'message' && context.activity.text) {
            // Verifica se o usuário enviou o comando "sair".
            if (context.activity.text.toLowerCase() === 'sair') {
                // Envia uma resposta.
                context.sendActivity('Tchauzinho!');
                process.exit();
            } else {
                // Ecoa a mensagem de volta para o usuário.
                return context.sendActivity(`Você disse: "${ context.activity.text }"`);
            }
        }
    }
}

module.exports = { ConsoleBot };
