const fs = require('fs');

fs.writeFile('electron/Config.json', JSON.stringify({
    feedbackSendURL: String(process.env.FEEDBACK_SEND_URL),
    googleAPIKey: String(process.env.GOOGLE_API_KEY)
}), (err) => { });