// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const path = require('path');

const dotenv = require('dotenv');
// Importar configuração de bot necessária.
const ENV_FILE = path.join(__dirname, '.env');
dotenv.config({ path: ENV_FILE });

const restify = require('restify');

// Importar serviços bot necessários.
// Acesse https://aka.ms/bot-services para saber mais sobre as diferentes partes de um bot.
const {
    CloudAdapter,
    ConfigurationServiceClientCredentialFactory,
    createBotFrameworkAuthenticationFromConfiguration
} = require('botbuilder');

// O diálogo principal deste bot.
const { EchoBot } = require('./bot');

// Cria servidor http
const server = restify.createServer();
server.use(restify.plugins.bodyParser());

server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${ server.name } ouvindo ${ server.url }`);
    console.log('\nPara falar com o seu bot, abra o emulador e selecione "Open Bot"');
});

const credentialsFactory = new ConfigurationServiceClientCredentialFactory({
    MicrosoftAppId: process.env.MicrosoftAppId,
    MicrosoftAppPassword: process.env.MicrosoftAppPassword,
    MicrosoftAppType: process.env.MicrosoftAppType,
    MicrosoftAppTenantId: process.env.MicrosoftAppTenantId
});

const botFrameworkAuthentication = createBotFrameworkAuthenticationFromConfiguration(null, credentialsFactory);

// Criar adaptador.
// Acesse https://aka.ms/about-bot-Adapter para aprender mais sobre os adaptadores.
const adapter = new CloudAdapter(botFrameworkAuthentication);

// Pega-tudo para erros.
const onTurnErrorHandler = async (context, error) => {
    // Esta verificação grava erros no log .vs do console. app insights.
    // NOTA: No ambiente de produção, você deve considerar registrar isso no Azure
    //       application insights.
    console.error(`\n [onTurnError] unhandled error: ${ error }`);

    // Envie uma atividade de rastreio, que será exibida no Bot Framework Emulator
    await context.sendTraceActivity(
        'OnTurnError Trace',
        `${ error }`,
        'https://www.botframework.com/schemas/error',
        'TurnError'
    );

    // Envie uma mensagem para o usuário
    await context.sendActivity('O bot encontrou um erro ou bug.');
    await context.sendActivity('Para continuar a executar este bot, conserte o código-fonte do bot.');
};

// Defina o OnTurnError para o Singleton CloudAdapter.
adapter.onTurnError = onTurnErrorHandler;

// Crie o diálogo principal.
const myBot = new EchoBot();

// Ouça solicitações recebidas.
server.post('/api/messages', async (req, res) => {
    // Route recebeu uma solicitação para o adaptador para processamento
    await adapter.process(req, res, (context) => myBot.run(context));
});

// Ouça solicitações de atualização para streaming.
server.on('upgrade', async (req, socket, head) => {
    // Criar um adaptador para esta conexão do WebSocket para permitir armazenar dados da sessão.
    const streamingAdapter = new CloudAdapter(botFrameworkAuthentication);

    // Set OnTurnError para o CloudAdapter criado para cada conexão.
    streamingAdapter.onTurnError = onTurnErrorHandler;

    await streamingAdapter.process(req, socket, head, (context) => myBot.run(context));
});
