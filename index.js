const { buffer, json, send, text } = require('micro')
const cors = require('micro-cors')()
const {
  consumer_key,
  consumer_secret,
  access_token_key,
  access_token_secret
} = (
  process.env.NODE_ENV === "production"
) ? process.env : require("./config")
const twitter = new require("twitter")({
  consumer_key,
  consumer_secret,
  access_token_key,
  access_token_secret
})
const twitterParams = screen_name => ({ screen_name, count: 200 })
const getTweets = params => new Promise((resolve, reject) => {
  twitter.get("statuses/user_timeline", params, (err,tweets,res) => {
    if (err) {
      console.error(err)
      reject(err)
    } else {
      console.log(`${tweets.length} TWEETS`)
      updateCache(params.screen_name, tweets)
      resolve(tweets)
    }
  })
})

let cacheTable = {}
let cacheTime = 1000 * 60 * 60

const checkCache = (screen_name) => {
  console.log(`checkCache: ${screen_name}`)

  if (cacheTable[screen_name]) {
    if (new Date().getTime() - cacheTable[screen_name]['lastFetch'] < cacheTime) {
      return cacheTable[screen_name]['tweets']
    }
  }
  return false
}

const updateCache = (screen_name, tweets) => {
  console.log(`updateCache: ${screen_name}`)

  if (!cacheTable[screen_name]) {
    cacheTable[screen_name] = {}
  }
  cacheTable[screen_name]['tweets'] = tweets
  cacheTable[screen_name]['lastFetch'] = new Date().getTime()
}

const main = async (req, res) => {
  let { url, connection } = req

  console.log(`remoteAddress: ${connection.remoteAddress}`)

  if (url === '/') {
    send(res, 200, 'Alllll Gooooood')
  } else {
    let screen_name = url.slice(1, url.length)
    let cachedTweets = checkCache(screen_name)

    if (!cachedTweets || !cachedTweets.length) {
      console.log('tweets not cached, fetching')

      getTweets(twitterParams(screen_name))
        .then(tweets => send(res, 200, tweets))
        .catch(err => {
          send(res, 400, `Code ${err[0].code}: ${err[0].message}`)
        })
    } else {
      console.log('serving cached tweets')

      send(res, 200, cachedTweets)
    }
  }
}

module.exports = cors(main)
