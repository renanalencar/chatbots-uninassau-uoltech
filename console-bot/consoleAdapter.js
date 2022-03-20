/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const botbuilderCore = require('botbuilder-core');
const { BotAdapter, TurnContext, ActivityTypes } = botbuilderCore;
const readline = require('readline');

/**
 * Permite que um usuário se comunique com um bot a partir de uma janela do console.
 *
 * @remarks
 * O exemplo a seguir mostra a configuração típica do adaptador:
 *
 *
 * ```JavaScript
 * const { ConsoleAdapter } = require('botbuilder');
 *
 * const adapter = new ConsoleAdapter();
 * const closeFn = adapter.listen(async (context) => {
 *    await context.sendActivity(`Hello World`);
 * });
 * ```
 */
class ConsoleAdapter extends BotAdapter {
    /**
     * Cria uma nova instância do ConsoleAdapter.
     * @param [reference] Referência usada para customizar as informações de endereço das atividades enviadas do adaptador.
     */
    constructor(reference) {
        super();
        this.nextId = 0;
        this.reference = {
            channelId: 'console',
            user: { id: 'user', name: 'User1' },
            bot: { id: 'bot', name: 'Bot' },
            conversation: { id: 'convo1', name: '', isGroup: false },
            serviceUrl: '',
            ...reference
        };
    }

    /**
     * Começa a ouvir a entrada do console. Será retornada uma função que pode ser usada para interromper 
     * a escuta do bot e, portanto, encerrar o processo.
     *
     * @remarks
     * Ao receber a entrada do console, o fluxo é o seguinte:
     *
     * - Uma atividade de 'mensagem' será criada contendo o texto de entrada do usuário.
     * - Um `TurnContext` revogável será criado para a atividade.
     * - O contexto será roteado através de qualquer middleware registrado com [use()](#use).
     * - O manipulador de lógica de bots que foi passado será executado.
     * - A configuração da cadeia de promessas pela pilha de middleware será resolvida.
     * - O objeto de contexto será revogado e qualquer chamada futura para seus membros resultará em um 
     *   `TypeError` sendo lançado.
     *
     * ```JavaScript
     * const closeFn = adapter.listen(async (context) => {
     *    const utterance = context.activity.text.toLowerCase();
     *    if (utterance.includes('goodbye')) {
     *       await context.sendActivity(`Ok... Goodbye`);
     *       closeFn();
     *    } else {
     *       await context.sendActivity(`Hello World`);
     *    }
     * });
     * ```
     * @param logic Função que será chamada cada vez que uma mensagem for inserida pelo usuário.
     */
    listen(logic) {
        const rl = this.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        });
        rl.on('line', line => {
            // Inicializar atividade
            const activity = TurnContext.applyConversationReference(
                {
                    type: ActivityTypes.Message,
                    id: (this.nextId++).toString(),
                    timestamp: new Date(),
                    text: line
                },
                this.reference,
                true
            );
            // Criar contexto e executar o pipe de middleware
            const context = new TurnContext(this, activity);
            this.runMiddleware(context, logic).catch(err => {
                this.printError(err.toString());
            });
        });
        return () => {
            rl.close();
        };
    }

    /**
     * Permite que um bot envie uma mensagem proativa ao usuário.
     *
     * @remarks
     * As etapas de processamento para este método são muito semelhantes a [listen()](#listen) 
     * em que um `TurnContext` será criado que é então roteado através do middleware do adaptador 
     * antes de chamar o manipulador lógico passado. A principal diferença é que, como uma atividade
     * não foi realmente recebida, ela precisa ser criada. A atividade criada terá seus campos relacionados 
     * ao endereço preenchidos, mas terá um `context.activity.type === undefined`.
     *
     * ```JavaScript
     * function delayedNotify(context, message, delay) {
     *    const reference = TurnContext.getConversationReference(context.activity);
     *    setTimeout(() => {
     *       adapter.continueConversation(reference, async (ctx) => {
     *          await ctx.sendActivity(message);
     *       });
     *    }, delay);
     * }
     * ```
     * @param reference Um `ConversationReference` salvo durante uma mensagem anterior de um usuário. Isso pode ser calculado para qualquer atividade de entrada usando `TurnContext.getConversationReference(context.activity)`.
     * @param logic Um manipulador de função que será chamado para executar a lógica dos bots após a execução do middleware dos adaptadores.
     */
    continueConversation(reference, logic) {
        // Criar contexto e executar o pipe de middleware
        const activity = TurnContext.applyConversationReference(
            {},
            reference,
            true
        );
        const context = new TurnContext(this, activity);
        return this.runMiddleware(context, logic).catch(err => {
            this.printError(err.toString());
        });
    }

    /**
     * Registra um conjunto de atividades no console.
     *
     * @remarks
     * Chamar `TurnContext.sendActivities()` ou `TurnContext.sendActivity()` é a maneira preferida de
     * enviar atividades, pois isso garantirá que as atividades de saída foram endereçadas adequadamente
     * e que qualquer middleware interessado foi notificado.
     * @param context Contexto para o turno atual de conversa com o usuário.
     * @param activities Lista de atividades para enviar.
     */
    async sendActivities(context, activities) {
        /** @type {any[]} */
        const responses = [];
        for (const activity of activities) {
            responses.push({});

            switch (activity.type) {
            case 'delay':
                await this.sleep(activity.value);
                break;
            case ActivityTypes.Message:
                if (
                    activity.attachments &&
                    activity.attachments.length > 0
                ) {
                    const append =
                        activity.attachments.length === 1
                            ? '(1 attachment)'
                            : `(${ activity.attachments.length } attachments)`;
                    this.print(`${ activity.text } ${ append }`);
                } else {
                    this.print(activity.text || '');
                }
                break;
            default:
                this.print(`[${ activity.type }]`);
                break;
            }
        }
        return responses;
    }

    /**
     * Não há suporte para o ConsoleAdapter. Chamar este método ou `TurnContext.updateActivity()` 
     * resultará em um erro retornado.
     */
    updateActivity(context, activity) {
        return Promise.reject(new Error('ConsoleAdapter.updateActivity(): not supported.'));
    }

    /**
     * Não há suporte para o ConsoleAdapter. Chamar este método ou `TurnContext.deleteActivity()` 
     * resultará em um erro sendo retornado.
     */
    deleteActivity(context, reference) {
        return Promise.reject(new Error('ConsoleAdapter.deleteActivity(): not supported.'));
    }

    /**
     * Permite simular a interface do console em testes de unidade.
     * @param options Opções de interface do console.
     */
    createInterface(options) {
        return readline.createInterface(options);
    }

    /**
     * Registra o texto no console.
     * @param line Texto para imprimir.
     */
    print(line) {
        console.log(line);
    }

    /**
     * Registra um erro no console.
     * @param line Texto de erro para imprimir.
     */
    printError(line) {
        console.error(line);
    }

    sleep(milliseconds) {
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }
}
module.exports = { ConsoleAdapter };
