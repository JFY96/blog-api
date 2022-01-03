# API for blog application

An API for a blog application built using Node JS and Express JS, linked up to a MongoDB database, served as a backend for my [Blog Application](https://github.com/JFY96/blog-app) project.

This project was created alongside a React Front End application to learn how to do sessionless authentication which combined the usage of JWTs with a REST API, passport JS, and refresh tokens.

## Demo/Usage

To deploy.

Also see [Blog App](https://github.com/JFY96/blog-app).

## Technologies used

- NodeJS and ExpressJS
  - Third party npm packages including PassportJS
- MongoDB and Mongoose

## Quick Start

To get it running locally on your pc:

1. Set up Nodejs dev environment (npm etc)
2. In root of this repo, install dependencies:
    ```
    npm install
    ```
3. Set up environment variables file `.env` in root directory using `.env-TEMPLATE` as a guideline
4. Start the server
    ```
    npm run start
    ```
5. API Endpoints should then be available at http://localhost:3000/api/
   