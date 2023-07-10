const express = require('express');
const app = express();
const rateLimiter = require('./middlewares/rate-limiter');

app.use(express.json());

app.post(
  '/api1',
  rateLimiter({ secondsWindow: 60, allowedHits: 20 }),
  (req, res) => {
    return res.status(200).send({
      // use modified(by middleware) request object
      response: 'ok',
      callsInMinute: req.requests,
      ttl: req.ttl,
    });
  }
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Running on port: ${port}...`);
});
