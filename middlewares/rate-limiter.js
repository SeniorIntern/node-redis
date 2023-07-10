const redis = require('../redis-client');

function rateLimiter({ secondsWindow, allowedHits }) {
  return async function (req, res, next) {
    const ip = req.socket.remoteAddress;
    const requests = await redis.incr(ip);

    let ttl;
    if (requests === 1) {
      await redis.expire(ip, secondsWindow);
      ttl = secondsWindow;
    } else {
      ttl = await redis.ttl(ip);
    }

    if (requests > allowedHits)
      return res.status(503).send({
        response: 'error',
        callsInMinute: requests,
        ttl,
      });
    else {
      // modify request objects
      req.requests = requests;
      req.ttl = ttl;
      next();
    }
  };
}
module.exports = rateLimiter;
