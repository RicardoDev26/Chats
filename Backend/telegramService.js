const { TelegramClient } = require('telegram');
const fs = require('fs');
const { StringSession } = require('telegram/sessions');
const readline = require('readline');
const dotenv = require('dotenv')

dotenv.config()

const apiId = process.env.apiId 
const apiHash = process.env.API_HASH
const stringSession = new StringSession(fs.existsSync('./session.txt') ? fs.readFileSync('./session.txt', 'utf-8') : '');


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
});

async function startClient() {
    try {
        await client.start({
            phoneNumber: async () => new Promise((resolve) => rl.question('Please enter your number: ', resolve)),
            password: async () => new Promise((resolve) => rl.question('Please enter your password: ', resolve)),
            phoneCode: async () => new Promise((resolve) => rl.question('Please enter the code you received: ', resolve)),
            onError: (err) => console.log(err),
        });

        const sessionString = client.session.save();
        fs.writeFileSync('./session.txt', sessionString);


        console.log('You should now be connected.');
        console.log(client.session.save());

    } catch (error) {
        console.error('An error occurred during the login process:', error);
    } finally {
        rl.close();
    }
}

async function sendMessageToTelegram(message) {
    await client.sendMessage('me', { message });
}

module.exports = {
    startClient,
    sendMessageToTelegram,
};
