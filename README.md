# School Administration System

Backend APIs of School Administration System (SAS), which will be used by school administrators and teachers to perform various administrative functions.

## Prerequisites

- NodeJS v12.18.3
- Docker

<br>

## Package Structure

| S/N | Name                                                 | Type | Description                          |
| --- | ---------------------------------------------------- | ---- | ------------------------------------ |
| 1   | typescript                                           | dir  | The source code                      |
| 2   | NodeJS_Assessment.pdf                                | file | The specification for the assignment |
| 3   | README.md                                            | file | This file                            |
| 4   | school-administration-system.postman_collection.json | file | Postman script for uploading file    |

<br>

## Exposed Port

| S/N | Application | Exposed Port |
| --- | ----------- | ------------ |
| 1   | database    | 33306        |
| 2   | application | 3000         |

<br>

## Commands

All the commands listed should be ran in ./typescript directory.

### Installing dependencies

```bash
npm install
```

<br>

### Starting Project

Starting the project in local environment.
This will start all the dependencies services i.e. database.

```bash
npm start
```

<br>

### Running in watch mode

This will start the application in watch mode.

```bash
npm run start:dev
```

<br>

### Check local application is started

You should be able to call (GET) the following endpoint and get a 200 response

```
http://localhost:3000/api/healthcheck
```

<br>
