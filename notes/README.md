# Notes

Notes is a fullstack web application, built with Node.js/Express and React, for writing notes and sharing them with friends. The application has a RESTful API, multiple persistent storage options, cookie-based authentication and WebSocket connections.

## Features/Use Cases

- Jot down quick ideas or save longer notes and have them at your disposal
- Write to-do lists, shopping lists, paste excerpts from books and websites, etc.
- Work on a collaborative notebook with friends
- Enjoy a convenient and mobile-friendly UI
- Receive real-time updates about notes that have been added, edited or deleted by other users
- Authenticate securely into the application
- Search notes quickly by title
- Manage user data with a CLI
- Choose a data storage set-up that suits your preferences and needs
    - File system
    - LevelDB
    - SQLite
    - PostgreSQL
- Keep your notes private on your own server
- Deploy easily and for free to Heroku

## Architecture

### Back-End

The back-end of Notes is built with Node.js and Express. It can be set up with multiple data storage options that are selectable via environment variable upon runtime. The supported databases are LevelDB, SQLite, PostgreSQL and Sequelize/MySQL. Aside from that, data can also be persisted to the file system. Cookie-based authentication is realized with Passport.js.

The front-end is a React application, styled with TailwindCSS. Client-side routing is handled with React Router.

For a dynamic communication between server and client, WebSockets are implemented with Socket.IO.

