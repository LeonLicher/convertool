import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const port = 8080;

app.use(cors({
    origin: '*'
}));

app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
    res.json({ message: 'Server is running' });
});

// Add new interfaces at the top
interface GuessResponse {
    matches: {
        name: boolean;
        teamName: boolean;
        position: boolean;
        marketValue: 'higher' | 'lower' | 'correct' | null;
        number: boolean;
        points: 'higher' | 'lower' | 'correct' | null;
    };
    isCorrect: boolean;
    guessedPlayer: any; // You can type this properly based on your Player interface
}

// Add new endpoint for making guesses
app.post('/makeGuess', async (req, res) => {
    const { playerId } = req.body;
    const targetPlayerId = "237"; // Manuel Neuer - In production, this should be randomly selected or stored in session

    if (!playerId) {
        return res.status(400).json({ message: 'Player ID is required' });
    }

    try {
        const filePath = path.join(__dirname, 'all_players.json');
        const data = fs.readFileSync(filePath, 'utf8');
        const playerData = JSON.parse(data);

        const guessedPlayer = playerData.players[playerId];
        const targetPlayer = playerData.players[targetPlayerId];

        if (!guessedPlayer || !targetPlayer) {
            return res.status(404).json({ message: 'Player not found' });
        }

        const matches = {
            name: guessedPlayer.name === targetPlayer.name,
            teamName: guessedPlayer.teamName === targetPlayer.teamName,
            position: guessedPlayer.position === targetPlayer.position,
            marketValue: guessedPlayer.marketValue === targetPlayer.marketValue ? 'correct' :
                        guessedPlayer.marketValue > targetPlayer.marketValue ? 'higher' : 'lower',
            number: guessedPlayer.number === targetPlayer.number,
            points: guessedPlayer.totalPoints === targetPlayer.totalPoints ? 'correct' :
                    guessedPlayer.totalPoints > targetPlayer.totalPoints ? 'higher' : 'lower'
        };

        const response: GuessResponse = {
            matches: matches as GuessResponse['matches'],
            isCorrect: playerId === targetPlayerId,
            guessedPlayer
        };

        res.json(response);

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            message: 'Failed to process guess',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

app.get('/getPlayer', async (req, res) => {
    const { name } = req.query;

    if (!name) {
        return res.status(400).json({ message: 'Name is required' });
    }

    console.log('One Player data request received');
    
    try {
        // Get absolute path to the JSON file
        const filePath = path.join(__dirname, 'all_players.json');
        
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ message: 'Player data file not found' });
        }

        // Read and parse the JSON file
        const data = fs.readFileSync(filePath, 'utf8');
        const playerData = JSON.parse(data);

        console.log(`Sending data for ${Object.keys(playerData.players).length} players`);
        const player = playerData.players[name as string];
        
        if (!player) {
            return res.status(404).json({ message: 'Player not found' });
        }

        res.json({ player });  // Send the found player in the response

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve player data',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

app.get('/getAllPlayers', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'all_players.json');
        const data = fs.readFileSync(filePath, 'utf8');
        const playerData = JSON.parse(data);

        // Only send minimal data needed for search
        const simplifiedPlayers = Object.entries(playerData.players).reduce((acc: any, [id, player]: [string, any]) => {
            acc[id] = {
                id,
                name: player.name,
                teamName: player.teamName
            };
            return acc;
        }, {});

        res.json({ 
            players: simplifiedPlayers,
            valid_team_ids: playerData.valid_team_ids 
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            message: 'Failed to retrieve player data',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});