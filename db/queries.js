var knex = require('./knex.js')

function Videos () {
  return knex('videos')
}

// *** queries *** //

function getAll () {
  return Videos().select()
}

function addVideo (content) {
  return Videos().insert(content, 'id')
}

function getSingleVideo (videoID) {
  return Videos()
    .where('id', parseInt(videoID))
    .first()
}

module.exports = {
  getAll: getAll,
  addVideo: addVideo,
  getSingleVideo: getSingleVideo
}
