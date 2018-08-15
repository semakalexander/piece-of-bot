const TelegramBot = require('node-telegram-bot-api');

const { token, channelId } = require('./keys');
const { TYPES } = require('./constants');
const { generateId, emoji } = require('./util');
const {
  createMessageRate,
  findMessageRates,
  like,
  okay,
  dislike,
} = require('./db');


const port = process.env.PORT || 7777;
const host = process.env.HOST;
const externalUrl = 'https://piece-of-bot.herokuapp.com';
const bot = new TelegramBot(token, { webHook: { port: port, host: host }});
bot.setWebHook(externalUrl + ':443/bot' + token);


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
              text: `${emoji.thumbs_up_emoji} (${likesAmount})`,
              callback_data: JSON.stringify({
                type: TYPES.LIKE,
                messageRateId
              })
            },
            { 
              text: `${emoji.thumbs_okay_emoji} (${okaysAmount})`,
              callback_data: JSON.stringify({
                type: TYPES.OKAY,
                messageRateId
              })
            },
            {
              text: `${emoji.thumbs_down_emoji} (${dislikesAmount})`,
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

  const messageRateId = generateId();

  generateReplyMarkup(messageRateId)
    .then(reply_markup => bot.sendPhoto(channelId, photoId, { reply_markup }))
    .catch(err => console.log(err))
});

bot.on('callback_query', query => {
  const {
    from,
    message: {
      message_id,
      chat: {
        id: chatId
      }
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
