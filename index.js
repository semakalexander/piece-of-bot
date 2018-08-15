const TelegramBot = require('node-telegram-bot-api');
const { token } = require('./credentials');
const { TYPES } = require('./constants');
const { data } = require('./db');

const bot = new TelegramBot(token, { polling: true });

generateReplyMarkup = (msgId) => {
  let likesAmount = 0;
  let dislikesAmount = 0;
  const messageRateInfo = data[msgId] || {};
  if(data[msgId]) {
    likesAmount = messageRateInfo.likes && messageRateInfo.likes.size;
    dislikesAmount = messageRateInfo.dislikes && messageRateInfo.dislikes.size;
  }

  return {
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
  }
}
      


bot.on('message', msg => {
  const reply_markup = generateReplyMarkup(msg.message_id);
  bot.sendMessage(msg.chat.id, 'hey', { reply_markup })
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

  if(!data[msgId]) {
    data[msgId] = {
      likes: new Set(),
      dislikes: new Set()
    };
  }

  let resultMsg = '';
  switch(type) {
    case TYPES.LIKE:
      resultMsg = like(msgId, from.id);
      break;
    case TYPES.DISLIKE:
      resultMsg = dislike(msgId, from.id);
      break; 
  }

  bot.answerCallbackQuery(query.id, { text: resultMsg });

  const reply_markup = generateReplyMarkup(msgId);

  bot.editMessageReplyMarkup(reply_markup, {
    message_id: msgId,
    chat_id: chatId,
  })
})