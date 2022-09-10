const express = require("express");
const app = express();
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("*** Server is running at http://localhost:3000/ ***");
    });
  } catch (e) {
    console.log(`DB Error Message: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertToObject = (dbResponseObject) => {
  return {
    playerId: dbResponseObject.player_id,
    playerName: dbResponseObject.player_name,
    jerseyNumber: dbResponseObject.jersey_number,
    role: dbResponseObject.role,
  };
};

//Get all Players

app.get("/players/", async (request, response) => {
  const playersSqlQuery = `
    SELECT
      *
    FROM
        cricket_team;`;
  const playerData = await db.all(playersSqlQuery);
  response.send(playerData.map((eachPlayer) => convertToObject(eachPlayer)));
});

//Add a Player

app.post("/players/", async (request, response) => {
  const playersDetails = request.body;
  const { playerName, jerseyNumber, role } = playersDetails;
  const AddPlayerQuery = `
    INSERT INTO 
        cricket_team (player_name,jersey_number,role)
    VALUES
        ('${playerName}',
        ${jerseyNumber},
        '${role}');`;
  await db.run(AddPlayerQuery);
  response.send("Player Added to Team");
});

//Get a Player by Id

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerIdQuery = `
    SELECT
      *
    FROM
        cricket_team
    WHERE
        player_id = ${playerId};`;
  const uniquePlayer = await db.get(playerIdQuery);
  response.send(convertToObject(uniquePlayer));
});

//Update a Player

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePLayerQuery = `
    UPDATE
        cricket_team
    SET
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
    WHERE
        player_id = ${playerId};`;
  await db.run(updatePLayerQuery);
  response.send("Player Details Updated");
});

//Remove a Player

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const removePlayerQuery = `
    DELETE
    FROM
        cricket_team
    WHERE
        player_id = ${playerId};`;
  await db.run(removePlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
