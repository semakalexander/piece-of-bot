const mongoose = require('mongoose');
const { mongoURI } = require('./credentials');
const { NOTIFICATION_MESSAGES } = require('./constants');

mongoose
  .connect(mongoURI, { useNewUrlParser: true })
  .then(() => console.log('Mongodb successfully connected'))
  .catch(err => console.error(err));


const messageRateSchema = new mongoose.Schema({
  id: String,
  likes: [Number], // set of users id,
  okays: [Number], // set of users id
  dislikes: [Number] // set of users id
});

const MessageRate = mongoose.model('MessageRate', messageRateSchema);

const createMessageRate = id => MessageRate.create({ id, likes: [], okays: [], dislikes: [] });

const findMessageRates = criteria => MessageRate.find(criteria);

const like = (id, userId) => new Promise((resolve, reject) => 
  MessageRate
    .findOne({ id })
    .then(record => {
      let resultMsg = NOTIFICATION_MESSAGES.LIKE;

      if(record.likes.some(id => id === userId)) {
        record.likes = record.likes.filter(id => id !== userId);
        resultMsg = NOTIFICATION_MESSAGES.UNLIKE;
      } else {
        record.likes = [...record.likes, userId];
      }
    
      if(record.dislikes.some(id => id === userId)) {
        record.dislikes = record.dislikes.filter(id => id !== userId);
      }

      if(record.okays.some(id => id === userId)) {
        record.okays = record.okays.filter(id => id !== userId);
      }
      
      record.save().then(() => resolve(resultMsg))
    })
    .catch(err => reject(err))
);

const okay = (id, userId) => new Promise((resolve, reject) => 
  MessageRate
    .findOne({ id })
    .then(record => {
      let resultMsg = NOTIFICATION_MESSAGES.OKAY;

      if(record.okays.some(id => id === userId)) {
        record.okays = record.okays.filter(id => id !== userId);
        resultMsg = NOTIFICATION_MESSAGES.UNOKAY;
      } else {
        record.okays = [...record.okays, userId];
      }

      if(record.likes.some(id => id === userId)) {
        record.likes = record.likes.filter(id => id !== userId);
      }

      if(record.dislikes.some(id => id === userId)) {
        record.dislikes = record.dislikes.filter(id => id !== userId);
      }

      record.save().then(() => resolve(resultMsg));
    })
);

const dislike = (id, userId) => new Promise((resolve, reject) =>
  MessageRate
    .findOne({ id })
    .then(record => {
      let resultMsg = NOTIFICATION_MESSAGES.DISLIKE;

      if(record.dislikes.some(id => id === userId)) {
        record.dislikes = record.dislikes.filter(id => id !== userId);
        resultMsg = NOTIFICATION_MESSAGES.UNDISLIKE;
      } else {
        record.dislikes = [...record.dislikes, userId];
      }
    
      if(record.likes.some(id => id === userId)) {
        record.likes = record.likes.filter(id => id !== userId);
      }

      if(record.okays.some(id => id === userId)) {
        record.okays = record.okays.filter(id => id !== userId);
      }
    
      record.save().then(() => resolve(resultMsg))
    })
    .catch(err => reject(err))
);

const getMessageRates = () => MessageRate.find();

module.exports = {
  createMessageRate,
  findMessageRates,
  like,
  okay,
  dislike,
  getMessageRates
};
