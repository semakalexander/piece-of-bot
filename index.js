const TelegramBot = require('node-telegram-bot-api');
const uniqid = require('uniqid');

const { token, channelId, channelMusicId } = require('./keys');
const { TYPES, EMOJI, USER_IDS } = require('./constants');
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


bot.on('photo', ({ photo }) => {
  const photoId = photo[photo.length - 1].file_id;

  const messageRateId = uniqid();

  generateReplyMarkup(messageRateId)
    .then(reply_markup => bot.sendPhoto(channelId, photoId, { reply_markup }))
    .catch(err => console.log(err))
});

bot.on('text', (message) => {
  const { text } = message;

  if (!text.includes('youtu.be') && !text.includes('youtube')) {
    return;
  }

  const messageRateId = uniqid();
  
  generateReplyMarkup(messageRateId)
    .then(reply_markup => bot.sendMessage(channelMusicId, text, { reply_markup }))
    .catch(err => console.log(err));
})

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
