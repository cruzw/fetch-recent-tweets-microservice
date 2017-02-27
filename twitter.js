const TWITTER_CLIENT = require("twitter");
const isProductionEnv = process.env.NODE_ENV === "production";
const twitterApiConfigSrc = isProductionEnv ? process.env : require("./config");

let {
  consumer_key,
  consumer_secret,
  access_token_key,
  access_token_secret
} = twitterApiConfigSrc;

const TWITTER_CONFIG = {
  consumer_key,
  consumer_secret,
  access_token_key,
  access_token_secret
};

module.exports = new TWITTER_CLIENT(TWITTER_CONFIG);
