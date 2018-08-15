const uniqid = require('uniqid');
const generateId = () => uniqid();

const thumbs_up_emoji = '❤️';
const thumbs_okay_emoji = '👌🏻';
const thumbs_down_emoji = '💩';
	
module.exports = {
  generateId,
  emoji: {
    thumbs_up_emoji,
    thumbs_okay_emoji,
    thumbs_down_emoji
  }
};
