const mongoose = require('mongoose');
const { mongoURI } = require('./credentials');

mongoose
  .connect(mongoURI, { useNewUrlParser: true })
  .then(() => console.log('Mongodb successfully connected'))
  .catch(err => console.error(err));


const messageRateSchema = new mongoose.Schema({
  msgId: Number,
  likes: [Number], // set of users id
  dislikes: [Number] // set of users id
});

const MessageRate = mongoose.model('MessageRate', messageRateSchema);

const createMessageRate = msgId => MessageRate.create({ msgId, likes: [], dislikes: [] });

const findMessageRates = criteria => MessageRate.find(criteria);

const like = (msgId, userId) => new Promise((resolve, reject) => 
  MessageRate
    .findOne({ msgId })
    .then(record => {
      let resultMsg = 'You liked this photo';

      if(record.likes.some(id => id === userId)) {
        record.likes = record.likes.filter(id => id !== userId);
        resultMsg = 'You unliked this photo';
      } else {
        record.likes = [...record.likes, userId];
      }
    
      if(record.dislikes.some(id => id === userId)) {
        record.dislikes = record.dislikes.filter(id => id !== userId);
      }
      
      record.save().then(() => resolve(resultMsg))
    })
    .catch(err => reject(err))
);

const dislike = (msgId, userId) => new Promise((resolve, reject) =>
  MessageRate
    .findOne({ msgId })
    .then(record => {
      let resultMsg = 'You disliked this photo';

      if(record.dislikes.some(id => id === userId)) {
        record.dislikes = record.dislikes.filter(id => id !== userId);
        resultMsg = 'You undisliked this photo';
      } else {
        record.dislikes = [...record.dislikes, userId];
      }
    
      if(record.likes.some(id => id === userId)) {
        record.likes = record.likes.filter(id => id !== userId);
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
  dislike,
  getMessageRates
};
