const TYPES = {
  LIKE: 'LIKE',
  OKAY: 'OKAY',
  DISLIKE: 'DISLIKE'
};

const NOTIFICATION_MESSAGES = {
  LIKE: `You think it's piece of something sooper dooper cool!`,
  UNLIKE: `You think it's piece of nothing`,
  OKAY: `You think it's piece of just ok`,
  UNOKAY: `You think it's piece of nothing`,
  DISLIKE: `You think it's piece of shit`,
  UNDISLIKE: `You think it's piece of nothing`
};

const EMOJI = {
  HEART: '❤️',
  THUMBS_OKAY: '👌🏻',
  POOP: '💩'
};

const USER_IDS = {
  skjerp_deg: 302182560
};

const KEYWORDS = {
  googleSearchKeywords: ['google ', 'гугл ', 'ggl '],
  googleImagesSearchKeywords: ['gglimg ', 'gglimgs ', 'googleimages '],
  youtubeSearchKeywords: ['youtube ',  'ютуб ', 'utube ', 'u2b '],
  youtubeLinkKeywords: [
    'tomusic',
    '2music',
    'piecelink',
    'p-link',
    'plink',
    'pieceofmusiclink',
    'music-link'
  ],
  photoToChannelKeywords: [
    'pic2channel',
    'pieceofphoto',
    'pieceofphotos',
    'img2channel',
    'post-img',
    'post-pic',
    '2photos',
    '2channel',
    'pimg',
    'ppic',
    '2img',
    '2pic',
    '2piece',
    '2po'
  ]
}

module.exports = {
  TYPES,
  NOTIFICATION_MESSAGES,
  EMOJI,
  USER_IDS,
  KEYWORDS
};
