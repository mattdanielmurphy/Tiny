const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const port = process.env.PORT || 8080;
const bodyParser = require('body-parser');

const urlDatabase = {
	"b2xVn2": {
		url: "http://www.lighthouselabs.ca",
		id: 'userRandomID'
	},
	"9sm5xK": {
		url: "http://www.google.com",
		id: 'fDj53n'
	}
};

const users = {
  "userRandomID": {
    id: "userRandomID", 
    email: "u", 
    password: "p"
	},
	"user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
	res.redirect('/urls');
});

app.get('/register', (req, res) => {	
	let templateVars = {
		user: users[req.cookies['user_id']]
	}
	res.render('register', templateVars)
});

app.get('/login', (req, res) => {
	let templateVars = {
		user: users[req.cookies['user_id']]
	}
	res.render('login', templateVars);
});

app.post('/register', (req, res) => {
	const randID = generateRandomString();
	if(req.body.email === '' || req.body.password === '') {
		res.redirect(400, '/register')
	} else {
		users[randID] = {
			id: randID,
			email: req.body.email,
			password: req.body.password
		}
		res.cookie('user_id', randID);
		res.redirect('/urls');
	}
});

app.post('/login', (req, res) => {
	if(req.body.email === '' || req.body.password === '') {
		res.redirect(400, '/login')
	} else {
		for(let i in users) {
			if (users[i].email === req.body.email) {
				if (users[i].password === req.body.password) {
					res.cookie('user_id', users[i].id);
					res.redirect('/urls');
				}
			}
		}
		res.redirect(403, '/login');
	}
});

app.post('/logout', (req, res) => {
	res.clearCookie('user_id');
	res.redirect('/urls')
});

app.get('/urls', (req, res) => {
	const userCookie = req.cookies['user_id'];
	// if existing cookie userID no longer matches a userID in database, clear it
	if(!userCookie || !users[userCookie]) {
		res.clearCookie('user_id');
	}
	let urls = [];
	let shortURL = Object.keys(urlDatabase);
	for (let i in urlDatabase) {
		urls.push(urlDatabase[i].url)
	}
	let templateVars = {
		urls: urls,
		shortURL: shortURL,
		user: users[req.cookies['user_id']]
	};
	res.render("urls_index", templateVars);
});

app.get('/urls/new', (req, res) => {
	if (req.cookies['user_id'] === undefined) {
		res.redirect('/login');
	} else {
		let templateVars = {
			user: users[req.cookies['user_id']]
		}
		res.render('urls_new', templateVars);
	}
});

function generateRandomString() {
	return Math.random().toString(36).substr(2, 6);
};

app.post('/urls', (req, res) => {
	let randomString = generateRandomString();
	let userID = req.cookies.user_id;
	urlDatabase[randomString] = {
		url: req.body.longURL,
		id: userID
	};
	// console.log(urlDatabase[req.cookies.user_id]);
	// urlDatabase[randomString][users[req.cookies['user_id']]] = req.body.longURL;
	res.redirect('/urls')
});

app.post('/urls/:id/delete', (req, res) => {
	delete urlDatabase[req.params.id];
	res.redirect('/urls')
});

app.post('/urls/:id/edit', (req, res) => {
	const shortURL = req.params.id;
	const newURL = req.body.newURL;
	urlDatabase[req.params.id].url = newURL;
	res.redirect('/urls')
});

app.get('/urls/:id', (req, res) => {
	let currentURL = urlDatabase[req.params.id];
	let templateVars = {
		shortURL: req.params.id,
		longURL: currentURL.url,
		user: users[req.cookies['user_id']]
	};
	if(templateVars.user.id === currentURL.id) {
		res.render('urls_show', templateVars);
	} else {
		res.redirect('/urls')
	}
});

app.get('/u/:shortURL', (req, res) => {
	let shortURL = req.params.shortURL;
	res.redirect(urlDatabase[shortURL]);
});

app.listen(port, () => {
	console.log(`App listening on port ${port}.\nhttp://localhost:${port}`)
});
