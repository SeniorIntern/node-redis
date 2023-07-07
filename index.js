const express = require('express');
const app = express();

app.use(express.json());

app.post('/data', async (req, res) => {
  const repo = req.body.repo;
  const response = await fetch(`https://api.github.com/repos/${repo}`).then(
    (t) => t.json()
  );

  res.json({
    status: 'ok',
    stars: response.stargazers_count,
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on port: ${port}...`);
});
