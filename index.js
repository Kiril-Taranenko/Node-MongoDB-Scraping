const cheerio = require('cheerio');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const hostname = process.env.MONGO_HOSTNAME;
const portnumber = process.env.MONGO_PORTNUMBER;
const database = process.env.MONGO_DATABASE_NAME;
const debugging = process.env.DEBUGGING;

const debugMod = false;

const GameModel = require('./src/models/Game');
const GameDetails = require('./src/clients/GameDetails');
const CatalogueParser = require('./src/parsers/Catalogue');
const utils = require('./src/utils');

const catalogue = new CatalogueParser([]);
const gameDetails = new GameDetails();
console.log('mongodb://'+hostname+':'+portnumber+'/'+database);
// should we handle username and password? mongoose.connect('mongodb://username:password@'hostname':'portnumber'/'database, { useNewUrlParser: true });
mongoose.connect('mongodb://'+hostname+':'+portnumber+'/'+database, { useNewUrlParser: true, useFindAndModify: true });

const db = mongoose.connection;

db.on('error', e => console.error("Database not connected: " + e));
db.once('open', () => console.log("Database connected OK"));


if(debugging == 'true'){
    console.log("Running in debug mode.");
    debugMod = true;
    // console.log("Dropping database...");
    // db.dropDatabase((err, result) => {
    //     if(!err) console.log("Database dropped.")
    // });
}

const boardGameGeekPagePromises = []

for (let i = 1; i < (debugMod ? 5 : 1242); i++){
    boardGameGeekPagePromises.push(new Promise((resolve, reject) => utils.delay(i * 2000).then(() => gameDetails.getGamesList(i)
        .then(games => {
            console.log("OK - fetching page ", i)
            const html = cheerio.load(games.data);
            return Promise.all(catalogue.parse(html).map(game =>
                gameDetails.getGameDetails(game).then(data => new GameModel(
                        data.objectid,
                        data.name,
                        data.yearpublished,
                        data.minplayers,
                        data.maxplayers,
                        data.playingtime,
                        data.minplaytime,
                        data.maxplaytime,
                        data.age,
                        data.description,
                        data.thumbnail,
                        data.image,//this needs fixing as now BGG has array for some games (i.e. handle string OR array of strings)
                        data.boardgameartist,
                        data.boardgamemechanic,
                        data.boardgamepublisher,
                        data.boardgamecategory,
                        data.boardgamedesigner
                    ).save()
                ))).then(boardGameGeekPageGames => resolve(boardGameGeekPageGames)
            );
        })
        .catch(e => {
            console.log(e);
            console.log("Failed - re-trying page ", i)
            return boardGameGeekPagePromises.push(gameDetails.getGamesList(i));
        }))))
}

Promise.all(boardGameGeekPagePromises).then(() => {
    mongoose.connection.close()
});
