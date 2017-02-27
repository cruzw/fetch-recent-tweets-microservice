const EXPRESS = require("express");
const SERVICE = EXPRESS();
const CACHE = require("apicache").middleware;
const PORT = process.env.PORT || 3000;
const TWITTER_CLIENT = require("./twitter");

const twitterParams = twitterHandle => ({
  screen_name: twitterHandle,
  count: 200 // Max. Allowed
});

const respondWithLast200Tweets = (req, res) => {
  res.setHeader("Access-Control-Expose-Headers", "*");
  res.setHeader("Access-Control-Allow-Origin", "*");

  console.log(`${new Date().toLocaleString()} - ${JSON.stringify(req.params)}`);

  getTweets(twitterParams(req.params.twitterHandle))
    .then(tweets => res.send(tweets))
    .catch(err => res.send(400));
};

const getTweets = params => new Promise((resolve, reject) => {
  TWITTER_CLIENT.get("statuses/user_timeline", params, (
    error,
    tweets,
    response
  ) => {
    if (error) {
      console.error(error);
      reject(error);
    } else {
      resolve(tweets);
    }
  });
});

SERVICE
.get("/", (req, res) => res.send("<h2> All GooD </h2>"))
  .get("/:twitterHandle", CACHE("5 minutes"), respondWithLast200Tweets)
  .listen(PORT, () => console.log(`SERVER listening on port ${PORT}`));
