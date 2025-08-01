# TinyApp Project

>TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Live Demo

[Running Application](https://tinyapp.lucascekan.com)


This app was refactored to be more in line as a **single page application (SPA)** the new url and login pages are not neccessary for my app. SPA are better for user experience and design, they reduce clicks and reduce rendering and they present a better architecture of the site. A stretch goal is to complete this proccess.

## Key Features

*   **Seamless In-Header Authentication:** Register and log in directly from the navigation bar without ever leaving the main page. The multi-step process provides a smooth, SPA-like user experience. User sessions are secured using `cookie-session` and passwords are encrypted with `bcrypt`.
*   **Dynamic URL Management:** Authenticated users can create, view, edit, and delete their own shortened URLs. The main dashboard only displays the URLs that belong to the logged-in user.
*   **Functional Redirect Endpoint:** Test the core functionality by clicking any generated short link. This will open the original destination URL in a new tab. The link itself points to a dedicated endpoint on the app (e.g., `/u/b6UTxQ`), proving that the application is handling the redirection logic.
*   **Follows REST principles** Using `method-override` package so that we use `PUT` and `Delete` methods to more closely align with REpresentional Transfer or REST architectural style.

## Final Product

!["screenshot description"](./screenshots/header_default.png)
!["Asks for password after valid username"](./screenshots/header_password.png)
!["This page creates new urls or edits them"](./screenshots/urls_show.png)
!["URL page whith only urls created by users showing"](./screenshots/urls.png)

## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.

## Description

This is a fully functional web-server and API

Works like other URL shortening services [TinyURL](http://tinyurl.com/), [Bitly](https://bitly.com/) or [Goo.gl](https://goo.gl/)

[Short Wikipedia Article about URL shortening](https://en.wikipedia.org/wiki/URL_shortening#Techniques)