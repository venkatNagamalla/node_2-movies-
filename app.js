const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("app is listening at localhost:30000");
    });
  } catch (e) {
    console.log(e.message);
    process.exit(1);
  }
};

const modifyMovie = (obj) => ({
  movieName: obj.movie_name,
});

const modifyDirector = (obj) => ({
  directorId: obj.director_id,
  directorName: obj.director_name,
});

//get all movies in database
app.get("/movies/", async (request, response) => {
  const getAllMovies = `SELECT * FROM movie`;
  const movies = await db.all(getAllMovies);
  response.send(movies.map((eachMovie) => modifyMovie(eachMovie)));
});

// adding a new movie into database
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addingNewMovie = `INSERT INTO movie
                               (director_id,movie_name,lead_actor)
                            VALUES
                               (${directorId},'${movieName}','${leadActor}')`;

  await db.run(addingNewMovie);
  response.send("Movie Successfully Added");
});

// get a single movie data from database
app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getMovie = `SELECT * FROM movie WHERE movie_Id = ${movieId}`;
  const movie = await db.get(getMovie);
  response.send({
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  });
});

//update a movie in database
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const data = request.body;
  const { directorId, leadActor, movieName } = data;
  const updateMovie = `UPDATE movie
                         SET
                            director_id=${directorId},
                            lead_actor='${leadActor}',
                            movie_name='${movieName}'
                         WHERE movie_id=${movieId} `;

  await db.run(updateMovie);
  response.send("Movie Details Updated");
});

//delete movie by movie id

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `DELETE FROM movie WHERE movie_id=${movieId}`;
  await db.run(deleteMovie);
  response.send("Movie Removed");
});

//get all directors in database
app.get("/directors/", async (request, response) => {
  const getAllDirectors = `SELECT * FROM director`;
  const directors = await db.all(getAllDirectors);
  response.send(directors.map((eachDirector) => modifyDirector(eachDirector)));
});

//get movies directed by directors from database
app.get("/directors/:directorId/movies", async (request, response) => {
  const { directorId } = request.params;
  const getAllDirectors = `SELECT movie_name FROM movie WHERE director_id=${directorId}`;
  const directorsList = await db.all(getAllDirectors);
  response.send(directorsList.map((eachDirector) => modifyMovie(eachDirector)));
});

initializeDbAndServer();

module.exports = app;
