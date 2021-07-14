const mongoose = require('mongoose');
const GameArtist = require('./GameArtist');
const GameMechanic = require('./GameMechanic');
const GamePublisher = require('./GamePublisher');
const GameCategory = require('./GameCategory');
const GameDesigner = require('./GameDesigner');
const AlternativeName = require('./AlternativeName');

const AlternativeNameSchema = new mongoose.Schema({
    id: String,
    name: String
});

const GameArtistSchema = new mongoose.Schema({
    id: String,
    name: String
});

const GameCategorySchema = new mongoose.Schema({
    id: String,
    category: String
});

const GameDesignerSchema = new mongoose.Schema({
    id: String,
    designer: String
});

const GameMechanicSchema = new mongoose.Schema({
    id: String,
    mechanic: String
});

const GamePublisherSchema = new mongoose.Schema({
    id: String,
    publisher: String
});

const schema = new mongoose.Schema({
    bggid: String,
    title: String,
    minPlayers: String,
    maxPlayers: String,
    playingTime: String,
    minPlaytime: String,
    maxPlaytime: String,
    age: String,
    description: String,
    thumbnail: String,
    image: String,//this needs fixing as now BGG has array for some games (i.e. handle string OR array of strings)
    yearPublished: String,
    gameArtists: [GameArtistSchema],
    gameMechanics: [GameMechanicSchema],
    gamePublishers: [GamePublisherSchema],
    gameCategories: [GameCategorySchema],
    gameDesigners: [GameDesignerSchema],
    alternativeNames: [AlternativeNameSchema]
});

const MongooseGame = mongoose.model('Game', schema, 'Games');

const parseName = name => name.filter ? name.filter(name => name.primary).map(name => name['$t'])[0] : name['$t'];

const parseGenericObjectIntoDomain = (data, Domain) => {
    if (!data) {
        return null;
    }

    if (data.filter) {
        return data.map(datum => {
            return new Domain(datum.objectid, datum['$t']);
        });
    }

    return [new Domain(data.objectid, data['$t'])];
};

const parseThumbnail = thumbnail => typeof thumbnail === "string" ? thumbnail : null;

class Game {
    constructor(
        bggid,
        title,
        yearPublished,
        minPlayers,
        maxPlayers,
        playingTime,
        minPlaytime,
        maxPlaytime,
        age,
        description,
        thumbnail,
        image,//this needs fixing as now BGG has array for some games (i.e. handle string OR array of strings)
        gameArtists,
        gameMechanics,
        gamePublishers,
        gameCategories,
        gameDesigners
    ) {
        this.bggid = bggid;
        this.title = parseName(title);
        this.yearPublished = yearPublished;
        this.minPlayers = minPlayers;
        this.maxPlayers = maxPlayers;
        this.playingTime = playingTime;
        this.minPlaytime = minPlaytime;
        this.maxPlaytime = maxPlaytime;
        this.age = age;
        this.description = description;
        this.thumbnail = parseThumbnail(thumbnail);
        this.image = image;//this needs fixing as now BGG has array for some games (i.e. handle string OR array of strings)
        this.gameArtists = parseGenericObjectIntoDomain(gameArtists, GameArtist);
        this.gameMechanics = parseGenericObjectIntoDomain(gameMechanics, GameMechanic);
        this.gamePublishers = parseGenericObjectIntoDomain(gamePublishers, GamePublisher);
        this.gameCategories = parseGenericObjectIntoDomain(gameCategories, GameCategory);
        this.gameDesigners = parseGenericObjectIntoDomain(gameDesigners, GameDesigner);
        this.alternativeNames = parseGenericObjectIntoDomain(title, AlternativeName);
    }

    async save(){
        let data = await MongooseGame.findOneAndUpdate({ bggid: this.bggid }, this, {new: true});
        // console.log(data, '');
            // console.log(this);
            // return MongooseGame.updateOne({ _id: this.bggid }, );
        // }

        // return new MongooseGame(this).save();
    }
}

module.exports = Game;
