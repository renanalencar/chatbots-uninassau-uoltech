/**
 * Source : https://github.com/microsoft/BotBuilder-Samples/tree/main/samples/javascript_nodejs/01.console-echo
 * Arquivo: index.js
 * Data: 18/02/2018
 * Descrição: Construindo um bot para ser executado via console (terminal).
 *            O bot irá receber uma mensagem e responder com uma mensagem.
 * Autor: Renan Alencar
 *
 */

const { ConsoleAdapter } = require('./consoleAdapter');

// Cria um novo adapter que será responsável por receber e responder as mensagens.
// Nós usamos o ConsoleAdapter que permite um bot conversar com você de dentro do console.
const adapter = new ConsoleAdapter();

// Importa a nossa classe bot
const { ConsoleBot } = require('./bot');
const bot = new ConsoleBot();

// Uma chamada para o adapter.listen faz o adaptador começar a escutar por mensagens e eventos de entrada, conhecidos por "activities".
// Activities são recebidas como objetos TurnContext pela a função handler.
adapter.listen(async (context) => {
    bot.onTurn(context);
});

// Emite uma mensagem inicial com algumas instruções.
console.log('> O Console Bot está online. Eu irei repetir qualquer mensagem que você enviar para mim!');
console.log('> Diga "sair" para finalizar o programa.');
console.log(''); // Deixa uma linha em branco depois das instruções.
