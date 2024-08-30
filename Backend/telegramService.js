const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const readline = require('readline');

const apiId = 24646760;
const apiHash = 'c923c3f958411266f95ddca4dd1b7eea';
const stringSession = new StringSession(''); 

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
});

async function startClient() {
    await client.start({
        phoneNumber: async () => new Promise((resolve) => rl.question('Please enter your number: ', resolve)),
        password: async () => new Promise((resolve) => rl.question('Please enter your password: ', resolve)),
        phoneCode: async () => new Promise((resolve) => rl.question('Please enter the code you received: ', resolve)),
        onError: (err) => console.log(err),
    });
    console.log('You should now be connected.');
    console.log(client.session.save()); // Guarda esta cadena para evitar iniciar sesión nuevamente
}

async function sendMessageToTelegram(message) {
    await client.sendMessage('me', { message });
}

module.exports = {
    startClient,
    sendMessageToTelegram,
};
