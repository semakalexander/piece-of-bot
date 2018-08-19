const TelegramBot = require('node-telegram-bot-api');
const uniqid = require('uniqid');

const { token, channelId, channelMusicId } = require('./keys');
const { TYPES, EMOJI, USER_IDS } = require('./constants');
const { textToSearchQuery } = require('./helpers');
const {
  createMessageRate,
  findMessageRates,
  like,
  okay,
  dislike,
} = require('./db');


const port = process.env.PORT || 7777;
const host = process.env.HOST;
const externalUrl = process.env.externalUrl;

let bot;
if(process.env.NODE_ENV !== 'production') {
  bot = new TelegramBot(token, { polling: true });
} else {
  bot = new TelegramBot(token, { webHook: { port: port, host: host }});
  bot.setWebHook(externalUrl + ':443/bot' + token);
}

generateReplyMarkup = (messageRateId) => new Promise((resolve, reject) => 
  findMessageRates({ id: messageRateId })
      .then(([messageRateInfo]) => {
        let likesAmount = 0;
        let okaysAmount = 0;
        let dislikesAmount = 0;

        if(messageRateInfo) {
          likesAmount = messageRateInfo.likes.length;
          okaysAmount = messageRateInfo.okays.length;
          dislikesAmount = messageRateInfo.dislikes.length;
        }
      
        resolve({
          inline_keyboard: [[
            { 
              text: `${EMOJI.HEART} (${likesAmount})`,
              callback_data: JSON.stringify({
                type: TYPES.LIKE,
                messageRateId
              })
            },
            { 
              text: `${EMOJI.THUMBS_OKAY} (${okaysAmount})`,
              callback_data: JSON.stringify({
                type: TYPES.OKAY,
                messageRateId
              })
            },
            {
              text: `${EMOJI.POOP} (${dislikesAmount})`,
              callback_data: JSON.stringify({
                type: TYPES.DISLIKE,
                messageRateId
              })
            }
          ]]
        })
      })
      .catch(err => reject(err))
);




const handleSearch = ({ message, base, keywords }) => {
  const { text, message_id } = message;

  if(keywords.some(keyword => text.includes(keyword))) {
    const query = textToSearchQuery(text, keywords);
    return bot.sendMessage(message.chat.id, base + query, { reply_to_message_id: message_id });
  }
}

const handleGoogleSearch = message => {
  const keywords = ['google ', 'гугл ', 'ggl '];
  const base = 'https://google.com/search?q=';
  return handleSearch({ message, base, keywords });
};

const handleGoogleImagesSearch = message => {
  const keywords = ['gglimg ', 'gglimgs ', 'googleimages '];
  const base = 'https://google.com/search?tbm=isch&q=';
  return handleSearch({ message, base, keywords });
}

const handleYoutubeSearch = message => {
  const keywords = ['youtube ',  'ютуб ', 'utube ', 'u2b '];
  const base = 'https://youtube.com/results?search_query=';
  return handleSearch({ message, base, keywords });
}

const handleYoutubeLink = ({ text }) => {
  const keywords = ['youtu.be', 'youtube.com'];
  if (keywords.some(keyword => text.includes(keyword))) {
    sendLinkYoutube(text);
  }
};

const sendLinkYoutube = link => {
  const messageRateId = uniqid();
  
  generateReplyMarkup(messageRateId)
    .then(reply_markup => bot.sendMessage(channelMusicId, link, { reply_markup }))
    .catch(err => console.log(err));
}






bot.on('photo', ({ photo }) => {
  const photoId = photo[photo.length - 1].file_id;

  const messageRateId = uniqid();

  generateReplyMarkup(messageRateId)
    .then(reply_markup => bot.sendPhoto(channelId, photoId, { reply_markup }))
    .catch(err => console.log(err))
});


bot.on('text', (message) => {  
  handleYoutubeLink(message);
  
  handleYoutubeSearch(message);

  handleGoogleImagesSearch(message);

  handleGoogleSearch(message);

});

bot.on('callback_query', query => {
  const {
    from,
    message: {
      message_id,
      chat: {
        id: chatId
      },
      photo
    },
    data
  } = query;

  const {
    type,
    messageRateId
  } = JSON.parse(data);

  findMessageRates({ id: messageRateId })
    .then(([messageRate]) => {
      if(!messageRate) {
        return createMessageRate(messageRateId);
      }

      return messageRate;
    })
    .then(() => {
      switch(type) {
        case TYPES.LIKE:
          return like(messageRateId, from.id);
        case TYPES.OKAY:
          return okay(messageRateId, from.id);
        case TYPES.DISLIKE:
          return dislike(messageRateId, from.id);
      }
    })
    .then(resultMsg => {
      bot.answerCallbackQuery(query.id, { text: resultMsg });
      const stat = {
        from: from.username,
        messageRateId,
        resultMsg
      };

      if (photo.length) {
        bot
          .sendPhoto(USER_IDS.skjerp_deg, photo[photo.length - 1].file_id)
          .then(() => bot.sendMessage(USER_IDS.skjerp_deg, JSON.stringify(stat, null, 2)))
      } else {
        bot.sendMessage(USER_IDS.skjerp_deg, JSON.stringify(stat, null, 2));
      }

    })
    .then(() => generateReplyMarkup(messageRateId))
    .then(reply_markup => {
        bot.editMessageReplyMarkup(reply_markup, {
          message_id,
          chat_id: chatId,
        });
    })
    .catch(err => console.log(err));
});
