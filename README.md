# Base Express Template

## Libraries
- [Inversify](http://inversify.io/)
- [Express](https://expressjs.com/)
- [Inversify Express Utils](https://github.com/inversify/inversify-express-utils)
- [Morgan](https://github.com/expressjs/morgan)
- [Winston](https://github.com/winstonjs/winston)
- [Body Parser](https://github.com/expressjs/body-parser)
- [TypeORM](https://typeorm.io/)

## Tools
- [Typescript](https://www.typescriptlang.org/)
- [Node (v14)](https://nodejs.org/en/)
- [NVM](https://github.com/nvm-sh/nvm)
- [Nodemon](https://nodemon.io/)
- [ts-node](https://github.com/TypeStrong/ts-node)

## Database
Currently this project is configured to use PostgreSQL 10.7. I am using 10.7 because my target platform is AWS RDS with Serverless PostgreSQL. Locally, use [Docker](https://www.docker.com/) to run a database for development and testing. The following command will setup a postgres database with a username of `postgres` and a password of `password`. The container name is defined by `PROJECT_NAME`. 

```bash
docker run --name PROJECT_NAME -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:10.7
```

### Generate Migrations
TypeORM can generate migrations based on the entities. 

 1. Delete the dist folder and build the project. `rm -r ./dist && yarn build`
 2. Generate new migrations given a configuration file `yarn typeorm migration:generate -n NAME_OF_MIGRATION --dir migrations -f ./migrations/ormconfig.local.json`
 3. Run the Migrations `yarn migrate-local`

 This assumes you want to migrate the local database.

 ### Testing
 Make sure to create the `test` schema on the local Postgres database. Then run tests with `yarn test`.

 ### Windows
 Stuck in Windows Hell? Use the following:
 
 ```cmd
 yarn typeorm-winblows
 ```

 ```cmd
 yarn migrate-local-winblows
 ```