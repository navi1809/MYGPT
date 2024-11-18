const express = require('express');
const bodyParser = require('body-parser');
const simpleGit = require('simple-git');
const fs = require('fs');
const path = require('path');

const app = express();
const git = simpleGit();

// Middleware for parsing JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve the UI
app.get('/', (req, res) => {
  res.render('index'); // Properly render the EJS template
});

// Commit and Push Changes
app.post('/commit', async (req, res) => {
  const content = req.body.content;

  if (!content) {
    return res.status(400).send('Content is required!');
  }

  const dataFilePath = path.join(__dirname, 'data.txt');

  try {
    // Clear the content of data.txt and write fresh content
    fs.writeFileSync(dataFilePath, ''); // Clears the file
    fs.writeFileSync(dataFilePath, content); // Writes fresh content

    // Git operations
    await git.add(dataFilePath);
    await git.commit('Updated data');
    await git.push();

    res.status(200).send('Commit and Push successful!');
  } catch (err) {
    res.status(500).send(`Error: ${err.message}`);
  }
});

// Pull Latest Changes
app.get('/pull', async (req, res) => {
  const dataFilePath = path.join(__dirname, 'data.txt');

  try {
    // Pull changes from the remote repository
    await git.pull();

    // Check if the file exists and read its content
    const content = fs.existsSync(dataFilePath) ? fs.readFileSync(dataFilePath, 'utf-8') : 'No data available';
    res.status(200).json({ content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start the Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
