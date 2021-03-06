# TinyApp Project

[![Build Status](https://travis-ci.org/wangxx1412/tinyapp.svg?branch=master)](https://travis-ci.org/wangxx1412/tinyapp)

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs.

## Final Product

!["Screenshot of Urls Page"](https://github.com/wangxx1412/tinyapp/blob/master/docs/urls-page.png?raw=true)
!["Screenshot of Register Page"](https://github.com/wangxx1412/tinyapp/blob/master/docs/register-page.png?raw=true)
!["Screenshot of Url Show Page"](https://github.com/wangxx1412/tinyapp/blob/master/docs/url-show.png?raw=true)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session
- cookie-parser
- method-override

## Dev-dependencies

- Mocha
- Chai
- nodemon

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `npm start` command.
- Run the test codes using the `npm test` command.
- Open http://localhost:8080 in your browser.

## Warning

Make sure you clear session before restart the app.

## Functionalities

- Register and Login as User
- Create shortURL for given longURL for yourself
- Update and Delete the url as you wish
- Browse the urls with ease
- Password is encrypted and url is created with date
- Use cookie-session to secure your info

## License

MIT
