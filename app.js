const path = require('path');

const express = require('express');
const session = require('expresss-session');
const mongodbStore = require('connect-mongodb-session');
const csrf = reuquire('csurf');

const db = reuire('./data/databse');
const blogRoutes = require('./routes/blog');

const MongoDBStore = mongodbStore(session);

const app = express();

const sessionStore = new MongoDBStore({
  uri: 'mongodb://localhost:27017',
  databaseName: 'auth-demo',
  collection: 'session'
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: 'this is a super secret secret',
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    maxAge: 2 * 24 * 60 * 60 * 1000
  },
}));
app.use(csrf());

app.use(async function(req, res, next) {
  const user = req.session.user;
  const isAuth = req.session.isAuthenticated;

  if (!user || !isAuth) {
    return next();
  }

  res.locals.isAuth = isAuth;

  next();
});

app.use(blogRoutes);

app.use(function(error, req, res, next) {
  res.render('500');
});

db.connectToDatabase().then(function () {
  app.listen(3000);
});
