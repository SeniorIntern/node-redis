const redis = require('./redis-client');
const express = require('express');
const app = express();

app.use(express.json());

app.post('/data', async (req, res) => {
  const repo = req.body.repo;

  let timeStart = Date.now();
  const value = await redis.get(repo);
  if (value) {
    const timeEnd = Date.now();
    return res.json({
      from: 'redis',
      status: 'ok',
      stars: value,
      timeForRet: timeEnd - timeStart,
    });
  }

  timeStart = Date.now(); // re-initialize again for remote
  const response = await fetch(`https://api.github.com/repos/${repo}`).then(
    (t) => t.json()
  );

  const timeEnd = Date.now();

  if (response.stargazers_count != undefined)
    await redis.setex(repo, 60, response.stargazers_count);

  res.json({
    from: 'remote',
    status: 'ok',
    stars: response.stargazers_count,
    timeForRet: timeEnd - timeStart,
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on port: ${port}...`);
});
