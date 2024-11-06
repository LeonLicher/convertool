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

app.get('/getAllPlayers', async (req, res) => {
    console.log('Player data request received');
    
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
        res.json(playerData);

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