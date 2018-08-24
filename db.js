const mongoose = require('mongoose');
const { mongoURI } = require('./keys');
const { NOTIFICATION_MESSAGES, USER_IDS } = require('./constants');

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

const statisticsSchema = new mongoose.Schema({
  id: String,
  data: {}
});


const MessageRate = mongoose.model('MessageRate', messageRateSchema);
const Statistics = mongoose.model('Statistics', statisticsSchema);

const createMessageRate = (id, photoId) => MessageRate.create({ id, likes: [], okays: [], dislikes: [], photoId });

const findMessageRates = criteria => MessageRate.find(criteria);

const like = (id, user) => new Promise((resolve, reject) => 
  MessageRate
    .findOne({ id })
    .then(record => {
      let resultMsg = NOTIFICATION_MESSAGES.LIKE;

      if(record.likes.some(u => u.id === user.id)) {
        record.likes = record.likes.filter(u => u.id !== user.id);
        resultMsg = NOTIFICATION_MESSAGES.UNLIKE;
      } else {
        record.likes = [...record.likes, user];
      }
    
      if(record.dislikes.some(u => u.id === user.id)) {
        record.dislikes = record.dislikes.filter(u => u.id !== user.id);
      }

      if(record.okays.some(u => u.id === user.id)) {
        record.okays = record.okays.filter(u => u.id !== user.id);
      }
      
      record.save().then(() => resolve(resultMsg))
    })
    .catch(err => reject(err))
);

const okay = (id, user) => new Promise((resolve, reject) => 
  MessageRate
    .findOne({ id })
    .then(record => {
      let resultMsg = NOTIFICATION_MESSAGES.OKAY;

      if(record.okays.some(u => u.id === user.id)) {
        record.okays = record.okays.filter(u => u.id !== user.id);
        resultMsg = NOTIFICATION_MESSAGES.UNOKAY;
      } else {
        record.okays = [...record.okays, user];
      }

      if(record.likes.some(u => u.id === user.id)) {
        record.likes = record.likes.filter(u => u.id !== user.id);
      }

      if(record.dislikes.some(u => u.id === user.id)) {
        record.dislikes = record.dislikes.filter(u => u.id !== user.id);
      }

      record.save().then(() => resolve(resultMsg));
    })
);

const dislike = (id, user) => new Promise((resolve, reject) =>
  MessageRate
    .findOne({ id })
    .then(record => {
      let resultMsg = NOTIFICATION_MESSAGES.DISLIKE;

      if(record.dislikes.some(u => u.id === user.id)) {
        record.dislikes = record.dislikes.filter(id => id !== user.id);
        resultMsg = NOTIFICATION_MESSAGES.UNDISLIKE;
      } else {
        record.dislikes = [...record.dislikes, user];
      }
    
      if(record.likes.some(u => u.id === user.id)) {
        record.likes = record.likes.filter(u => u !== user.id);
      }

      if(record.okays.some(u => u.id === user.id)) {
        record.okays = record.okays.filter(u => u.id !== user.id);
      }
    
      record.save().then(() => resolve(resultMsg))
    })
    .catch(err => reject(err))
);

const getMessageRates = () => MessageRate.find();


const collectIdsByType = (o, rate, type) => {
  rate[type].forEach(u => {
    let id = u.id || u;

    const entry = Object.entries(USER_IDS).find(([key, value]) => value === id);
    id = entry ? entry[0] : id;
    
    if(!o[id]) {
      o[id] = {
        likes: [],
        okays: [],
        dislikes: []
      }
    }

    o[id][type].push({ photoId: rate.photoId, rateId: rate.id });
  })
}

const updateStats = () =>
  Statistics
    .remove({})
    .then(() => MessageRate.find({}))
    .then(rates => rates
      .reduce((o, rate) => {
        collectIdsByType(o, rate, 'likes');
        collectIdsByType(o, rate, 'okays');
        collectIdsByType(o, rate, 'dislikes');
        return o;
      }, {})
    )
    .then(data => Statistics.create({ data }));

module.exports = {
  createMessageRate,
  findMessageRates,
  like,
  okay,
  dislike,
  getMessageRates,
  updateStats
};
