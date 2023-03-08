const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  };
};

//API_1

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    ;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

//API_2

app.post("/movies/", async (request, response) => {
  const moviesDetails = request.body;
  const { directorId, movieName, leadActor } = moviesDetails;
  const addMovieDetails = `
    INSERT INTO
      movie(director_id,movie_name,lead_actor)
    VALUES
      (
        6,
        "Jurassic Park",
        "Jeff Goldblum"
      );`;

  const dbResponse = await db.run(addMovieDetails);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//API_3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetails = `
    SELECT
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  const movie = await db.get(getMovieDetails);
  response.send(movie);
});

///API_4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieDetails = `
    UPDATE
      movie
    SET
      director_id= 24,
      movie_name= "Thor",
      lead_actor="Christopher Hemsworth"
    WHERE
      movie_id=${movieId};
      `;

  const dbResponse = await db.run(updateMovieDetails);

  response.send("Movie Details Updated");
});

//API_5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieDetails = `
    DELETE FROM
      movie
    
    WHERE
      movie_id=${movieId};
      `;

  const dbResponse = await db.run(deleteMovieDetails);

  response.send("Movie Removed");
});

//API-6
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
    SELECT
      *
    FROM
      director
    ;`;
  const directorArray = await db.all(getDirectorQuery);
  response.send(
    directorArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//API_7

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id=${directorId};
    ;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(
    moviesArray.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

module.exports = app;
