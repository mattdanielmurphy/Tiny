const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 8080;
const bodyParser = require('body-parser');
const urlDatabase = {
	"b2xVn2": "http://www.lighthouselabs.ca",
	"9sm5xK": "http://www.google.com"
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	res.redirect('/urls')
});

app.post('/login', (req, res) => {
	res.cookie('username', req.body.username);
	res.redirect('/urls')
});

app.post('/logout', (req, res) => {
	res.clearCookie('username');
	res.redirect('/urls')
})

app.get('/urls', (req, res) => {
	let urls = [];
	let shortURL = Object.keys(urlDatabase);
	for (let i in urlDatabase) {
		urls.push(urlDatabase[i])
	}
	let templateVars = {
		urls: urls,
		shortURL: shortURL,
		username: req.cookies['username']
	};
	res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
	res.render('urls_new');
})

function generateRandomString() {
	return Math.random().toString(36).substr(2, 6);
}

app.post('/urls', (req, res) => {
	let randomString = generateRandomString();
	urlDatabase[randomString] = req.body.longURL;
	res.redirect('/urls')
})

app.post('/urls/:id/delete', (req, res) => {
	delete urlDatabase[req.params.id];
	res.redirect('/urls')
})

app.post('/urls/:id/edit', (req, res) => {
		const newURL = req.body.newURL;
		urlDatabase[req.params.id] = newURL;
		res.redirect('/urls')
});

app.get('/urls/:id', (req, res) => {
	let templateVars = {
		shortURL: req.params.id,
		longURL: urlDatabase[req.params.id]
	};
	res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
	let shortURL = req.params.shortURL;
	res.redirect(urlDatabase[shortURL]);
})

app.listen(port, () => {
	console.log(`App listening on port ${port}.\nhttp://localhost:${port}`)
});
