require("dotenv").config();

const fs = require('fs');
let userCommand = "";
let userInput = "";

if (process.argv.length > 2) {
    userCommand = process.argv[2].toLowerCase();
}
if (process.argv.length > 3) {
    userInput = process.argv.slice(3).join("+").toLowerCase();
}

function logging(input) {
    console.log(input);
    input += '\n';
    fs.appendFile('output.txt', input, function (err) {
        if (err) {
            console.log(err);
        }
    });
}

function invalidEntry() {
    logging("* * * * * Invalid Entry * * * * *");
    logging("Invalid node command. Please enter one of the following:");
    logging("node liri.js concert-this <artist/band name here>");
    logging("node liri.js spotify-this-song <song name here>");
    logging("node liri.js movie-this <movie name here>");
    logging("node liri.js do-what-it-says");
}

function axiosAPI(userEntry) {
    const axios = require('axios');
    let query;

    if (userEntry == "concert-this") {
        query = "https://rest.bandsintown.com/artists/" + userInput + "/events?app_id=codingbootcamp";
    }
    else {
        query = "http://www.omdbapi.com/?t=" + userInput + "&apikey=trilogy";
    }

    axios.get(query).then(
        function (response) {

            if (userEntry == "concert-this") {
                logging("The concert will be held in venue " + response.data[0].venue.name + ".");
                logging("The city the venue will be in " + response.data[0].venue.city + ".");
                if (response.data[0].venue.region.length > 0) {
                    logging("The state/province the concert will be held in " + response.data[0].venue.region + ".");
                }
                logging("The country the concert will be in " + response.data[0].venue.country + ".");

                const moment = require('moment');
                const format = "MM-DD-YYYY";
                const concertDate = moment(response.data[0].datetime).format(format);
                logging("The concert will be held on " + concertDate + ".");
            }
            else {
                logging("The movie's title is " + response.data.Title + ".");
                logging("The year of the movie is " + response.data.Year + ".");
                logging("The movie's rating is " + response.data.imdbRating + ".");
                logging("The movie's Rotten Tomatoes rating is " + response.data.Ratings[1].Value + ".");
                logging("The movie was produced in " + response.data.Country + ".");
                logging("The language of the movie is " + response.data.Language + ".");
                logging("The plot of the movie is " + response.data.Plot + ".");
                logging("The actors of the movie are " + response.data.Actors + ".");
            }
        }
    ).catch(function (error) {
        if (error.response) {
            logging('---------------Data---------------');
            logging(error.response.data);
            logging('---------------Status---------------');
            logging(error.response.status);
            logging('---------------Status---------------');
            logging(error.response.headers);
        } else if (error.request) {
            logging(error.request);
        } else {
            logging('Error', error.message);
        }
        logging(error.config);
    });
}

function spotifyAPI(userEntry) {
    const keys = require("./keys.js");
    const SpotifyNodeAPI = require('node-spotify-api');
    const spotify = new SpotifyNodeAPI(keys.spotify);
    console.log(spotify);
    console.log('');
}

function userAction() {
    switch (userCommand) {
        case "concert-this":
        case "movie-this":
            axiosAPI(userCommand);
            break;
        case "spotify-this-song":
            spotifyAPI(userCommand);
            break;
        default:
            invalidEntry();
            break;
    }
}

if (userCommand == 'do-what-it-says') {
    fs.readFile('random.txt', 'utf8', function (error, data) {

        if (error) {
            return logging(error);
        }

        const dataArr = data.split(',').map((item) => item.trim());

        userCommand = dataArr[0].trim();
        userInput = dataArr[1].trim();
        userInput = userInput.split('"').join("");
        userInput = userInput.split(" ").join("+");
        logging("* * * * * do-what-it-says * * * * *");

        userAction();
    });
}
else if (userCommand == "concert-this" || userCommand == "movie-this" || userCommand == "spotify-this-song") {
    logging("* * * * * " + userEntry + "* * * * *");
    userAction();
}
else {
    invalidEntry();
}
