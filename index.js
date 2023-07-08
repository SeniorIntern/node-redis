const redis = require('./redis-client');
const express = require('express');
const app = express();

app.use(express.json());

app.post('/data', async (req, res) => {
  const repo = req.body.repo;

  const value = await redis.get(repo);
  if (value) {
    return res.json({
      from: 'redis',
      status: 'ok',
      stars: value,
    });
  }

  const response = await fetch(`https://api.github.com/repos/${repo}`).then(
    (t) => t.json()
  );

  if (response.stargazers_count != undefined)
    await redis.set(repo, response.stargazers_count);

  res.json({
    from: 'remote',
    status: 'ok',
    stars: response.stargazers_count,
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on port: ${port}...`);
});
