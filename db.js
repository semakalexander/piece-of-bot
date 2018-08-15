const data = {};

const like = (msgId, userId) => {
  let resultMsg = 'You liked this photo';
  if(data[msgId].likes.has(userId)) {
    data[msgId].likes.delete(userId);
    resultMsg = 'You unliked this photo'
  } else {
    data[msgId].likes.add(userId);
  }

  if(data[msgId].dislikes.has(userId)) {
    data[msgId].dislikes.delete(userId);
  }

  return resultMsg;
}
const dislike = (msgId, userId) => {
  let resultMsg = 'You disliked this photo';

  if(data[msgId].dislikes.has(userId)) {
    data[msgId].dislikes.delete(userId);
    resultMsg = 'You undisliked this photo';    
  } else {
    data[msgId].dislikes.add(userId);
  }

  if(data[msgId].likes.has(userId)) {
    data[msgId].likes.delete(userId);
  }

  return resultMsg;
};

module.exports = {
  data
};
