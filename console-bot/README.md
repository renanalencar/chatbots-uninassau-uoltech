# ConsoleBot
Construindo um bot para ser executado via console (terminal). O bot irá receber uma mensagem e responder com uma mensagem.

## Iniciando o projeto
Utilize os seguintes comando para construir o seu projeto:

1. Criando o diretório do projeto:
```
mkdir console-bot
cd console-bot
```
2. Inicializando um projeto NodeJS com as configurações padrão:
```
npm init -f 
```
3. Instalando os pacotes necessários para o projeto:
```
npm install --save botbuilder-core
npm install --save readline
```

## Estrutura do projeto
Abaixo segue a configuração de pastas e arquivos ao fim das construção do projeto.
```
|-- console-bot
    |-- bot.js
    |-- consoleAdapter.js
    |-- index.js
    |-- package-lock.json
```

## Execução deste projeto
Primeiro você deve instalar os pacotes necessários para a execução. No terminal acesse o diretório do projeto e digite o comando:
```
npm install
```

Para executar o programa digite o seguinte comando:
```
node index.js
```