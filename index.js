const TelegramBot = require('node-telegram-bot-api');
const { token } = require('./credentials');
const { TYPES } = require('./constants');
const {
  createMessageRate,
  findMessageRates,
  like,
  dislike,
} = require('./db');

const bot = new TelegramBot(token, { polling: true });

generateReplyMarkup = (msgId) => new Promise((resolve, reject) => 
  findMessageRates({ msgId })
      .then(([messageRateInfo]) => {
        let likesAmount = 0;
        let dislikesAmount = 0;

        if(messageRateInfo) {
          likesAmount = messageRateInfo.likes.length;
          dislikesAmount = messageRateInfo.dislikes.length;
        }
      
        resolve({
          inline_keyboard: [[
            { 
              text: `${TYPES.LIKE.toLowerCase()} (${likesAmount})`,
              callback_data: TYPES.LIKE
            },
            {
              text: `${TYPES.DISLIKE.toLowerCase()} (${dislikesAmount})`,
              callback_data: TYPES.DISLIKE
            }
          ]]
        })
      })
      .catch(err => reject(err))
);


bot.on('message', msg => {
  generateReplyMarkup(msg.message_id)
    .then(reply_markup => bot.sendMessage(msg.chat.id, 'hey', { reply_markup }))
    .catch(err => console.log(err))
});

bot.on('callback_query', query => {
  const {
    from,
    message: {
      message_id: msgId,
      chat: {
        id: chatId
      }
    },
    data: type
  } = query;

  findMessageRates({ msgId })
    .then(([messageRate]) => {
      if(!messageRate) {
        return createMessageRate(msgId);
      }

      return messageRate;
    })
    .then(() => {
      switch(type) {
        case TYPES.LIKE:
          return like(msgId, from.id);
        case TYPES.DISLIKE:
          return dislike(msgId, from.id);
      }
    })
    .then(resultMsg => {
      bot.answerCallbackQuery(query.id, { text: resultMsg });
    })
    .then(() => generateReplyMarkup(msgId))
    .then(reply_markup => {
        bot.editMessageReplyMarkup(reply_markup, {
          message_id: msgId,
          chat_id: chatId,
        });
    })
    .catch(err => console.log(err));
});
