const fs = require('fs');

fs.writeFile('./keys/translate.json', process.env.GOOGLE_CONFIG, err => console.error(err));
