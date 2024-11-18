const express = require('express');
const bodyParser = require('body-parser');
const simpleGit = require('simple-git');
const path = require('path');

const app = express();
const git = simpleGit();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve the UI
app.get('/', (req, res) => {
  res.render('index');
});

// Commit and push changes
app.post('/commit', async (req, res) => {
  const content = req.body.content;
  const filePath = path.join(__dirname, 'data.txt');

  // Write content to a file
  require('fs').writeFileSync(filePath, content);

  try {
    await git.add(filePath);
    await git.commit('Updated data');
    await git.push();
    res.send('Data committed and pushed!');
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

// Pull latest changes
app.get('/pull', async (req, res) => {
  try {
    await git.pull();
    res.send('Pulled latest changes from GitHub!');
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
