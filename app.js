const express = require('express');
const app = express();
const redis = require('./redis-client');

app.use(express.json());

app.post('/api1', async (req, res) => {
  const ip = req.socket.remoteAddress;

  const requests = await redis.incr(ip);

  let ttl;
  if (requests === 1) {
    await redis.expire(ip, 60);
    ttl = 60;
  } else {
    ttl = await redis.ttl(ip);
  }

  if (requests > 20)
    return res.status(503).send({
      response: 'error',
      callsInMinute: requests,
      ttl,
    });

  return res.status(200).send({
    response: 'ok',
    callsInMinute: requests,
    ttl,
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Running on port: ${port}...`);
});
