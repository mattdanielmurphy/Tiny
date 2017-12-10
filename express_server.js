// SET UP SERVER AND REQUIRES

const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const dialog = require('dialog');
const port = process.env.PORT || 8080;
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
	name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
app.set('view engine', 'ejs');

app.listen(port, () => {
	console.log(`App listening on port ${port}.\nhttp://localhost:${port}`)
});

// VARIABLES & FUNCTIONS

const urlDatabase = {
	"b2xVn2": {
		url: "http://www.lighthouselabs.ca",
		id: 'userRandomID',
		shortURL: 'b2xVn2'
	}
};

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "matt@mattmurphy.ca", 
    password: bcrypt.hashSync('p', 10)
	}
}

function urlsForUser(id) {
	let urls = [];
	let shortURLs = [];
	for(let i in urlDatabase) {
		if(urlDatabase[i].id === id) {
			urls.push(urlDatabase[i].url);
			shortURLs.push(urlDatabase[i].shortURL);
		}
	}
	return [urls, shortURLs];
}

function generateRandomString() {
	return Math.random().toString(36).substr(2, 6);
};

// INDEX

app.get('/', (req, res) => {
	res.redirect('/urls');
});

app.get('/urls', (req, res) => {
	const userCookie = req.session.user_id;
	let templateVars = {
		urls: urlsForUser(userCookie)[0],
		shortURLs: urlsForUser(userCookie)[1],
		user: users[userCookie]
	};
	res.render("urls_index", templateVars);
});

// RENDER register new user

app.get('/register', (req, res) => {	
	let templateVars = {
		user: users[req.session.user_id]
	}
	res.render('register', templateVars)
});

// RENDER login

app.get('/login', (req, res) => {
	let templateVars = {
		user: users[req.session.user_id]
	}
	res.render('login', templateVars);
});

// POST register

app.post('/register', (req, res) => {
	let randID = generateRandomString();
	if(req.body.email === '' || req.body.password === '') {
		res.redirect(400, '/register')
	} else {
		users[randID] = {
			id: randID,
			email: req.body.email,
			password: bcrypt.hashSync(req.body.password, 10)
		}
		req.session.user_id = randID;
		res.redirect('/urls');
	}
});

// POST login

app.post('/login', (req, res) => {
	if(req.body.email === '' || req.body.password === '') {
		res.redirect(400, '/login')
	} else {
		for(let i in users) {
			if (users[i].email === req.body.email) {
				if (bcrypt.compareSync(req.body.password, users[i].password)) {
					req.session.user_id = users[i].id;
					return res.redirect('/urls');
				}
			}
		}
		res.redirect(403, '/login');
	}
});

app.post('/logout', (req, res) => {
	req.session = null;
	res.redirect('/urls')
});

app.get('/urls/new', (req, res) => {
	const userCookie = req.session.user_id;
	const templateVars = {
		user: users[userCookie]
	}
	if (userCookie) {
		res.render('urls_new', templateVars);
	} else {
		res.redirect('/login');
	}
});

app.post('/urls', (req, res) => {
	let randomString = generateRandomString();
	let userID = req.session.user_id;
	const newURL = req.body.longURL;
	if(newURL.startsWith('http')) {
		urlDatabase[randomString] = {
			url: req.body.longURL,
			id: userID,
			shortURL: randomString
		};
		res.redirect('/urls')
	} else {
		dialog.err('URL entered is missing a protocol. (\'http://\')');
		res.redirect('back');
	};
});

app.post('/urls/:id/delete', (req, res) => {
	delete urlDatabase[req.params.id];
	res.redirect('/urls')
});

app.post('/urls/:id/edit', (req, res) => {
	const shortURL = req.params.id;
	const newURL = req.body.newURL;
	if(newURL.startsWith('http')) {
		urlDatabase[req.params.id].url = newURL;
		res.redirect('/urls')
	} else {
		dialog.err('URL entered is missing a protocol. (\'http://\')');
		res.redirect('back');
	}
});

app.get('/urls/:id', (req, res) => {
	let currentURL = urlDatabase[req.params.id];
	let templateVars = {
		shortURLs: req.params.id,
		longURL: currentURL.url,
		user: users[req.session.user_id]
	};
	if(templateVars.user.id === currentURL.id) {
		res.render('urls_show', templateVars);
	} else {
		res.redirect('/urls')
	}
});

app.get('/u/:shortURL', (req, res) => {
	let shortURL = req.params.shortURL;
	console.log(urlDatabase[shortURL]);
	res.redirect(urlDatabase[shortURL].url);
});
