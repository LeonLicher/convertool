import { useEffect, useState } from "react";
import { useHttpClient } from "../../contexts/HttpClientContext";
import './player-guess.scss';

interface Player {
    id: string;
    name: string;
    teamId: string;
    teamName: string;
    position: number;
    marketValue: number;
    averagePoints: number;
    totalPoints: number;
    number: number;
}

interface PlayerData {
    players: { [key: string]: Player };
    valid_team_ids: number[];
}

interface Guess {
    player: Player;
    matches: {
        name: boolean;
        teamName: boolean;
        position: boolean;
        marketValue: 'higher' | 'lower' | 'correct' | null;
        number: boolean;
        points: 'higher' | 'lower' | 'correct' | null;
    };
}

export function PlayerGuess() {
    const [playerData, setPlayerData] = useState<PlayerData | null>(null);
    const [guesses, setGuesses] = useState<Guess[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
    const [gameWon, setGameWon] = useState(false);
    const httpClient = useHttpClient();

    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const response = await httpClient.get('http://localhost:8080/getAllPlayers');
                const data = await response.json() as PlayerData;
                setPlayerData(data);
            } catch (error) {
                console.error('Failed to fetch players:', error);
            }
        };
        fetchPlayers();
    }, [httpClient]);

    useEffect(() => {
        if (playerData && searchTerm) {
            const filtered = Object.values(playerData.players)
                .filter(player => 
                    player.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    !guesses.some(guess => guess.player.id === player.id)
                )
                .slice(0, 5); // Limit to 5 suggestions
            setFilteredPlayers(filtered);
        } else {
            setFilteredPlayers([]);
        }
    }, [searchTerm, playerData, guesses]);

    const getPositionName = (position: number) => {
        switch(position) {
            case 1: return "GK";
            case 2: return "DEF";
            case 3: return "MID";
            case 4: return "FWD";
            default: return "?";
        }
    };

    const formatMarketValue = (value: number) => {
        return (value / 1000000).toFixed(1) + 'M €';
    };

    const handlePlayerSelect = async (player: Player) => {
        if (guesses.some(guess => guess.player.id === player.id)) {
            return; // Prevent duplicate guesses
        }

        try {
            const response = await httpClient.post('http://localhost:8080/makeGuess', {
                playerId: player.id
            });
            const data = await response.json();

            const newGuess: Guess = {
                player : data.guessedPlayer,
                matches: data.matches
            };
            
            setGuesses([...guesses, newGuess]);
            setSearchTerm('');
            setFilteredPlayers([]);

            if (data.isCorrect) {
                setGameWon(true);
            }
        } catch (error) {
            console.error('Failed to make guess:', error);
            // Add error handling UI if needed
        }
    };

    return (
        <div className="player-guess-container">
            <h1>Guess the Bundesliga Player</h1>
            
            {!gameWon && (
                <div className="search-section">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Type player name..."
                        className="search-input"
                        disabled={gameWon}
                    />
                    {filteredPlayers.length > 0 && (
                        <div className="player-suggestions">
                            {filteredPlayers.map(player => (
                                <div
                                    key={player.id}
                                    className="player-suggestion"
                                    onClick={() => handlePlayerSelect(player)}
                                >
                                    {player.name} ({player.teamName})
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="guesses-container">
                <div className="guess-row header">
                    {/* <div className="guess-cell">Name</div> */}
                    <div className="guess-cell">Team</div>
                    <div className="guess-cell">Pos</div>
                    <div className="guess-cell">Value</div>
                    <div className="guess-cell">#</div>
                    <div className="guess-cell">Points</div>
                </div>
                {guesses.map((guess, index) => (
                    <div key={index} className="guess-row">
                        {/* <div className={`guess-cell ${guess.matches.name ? 'correct' : 'incorrect'}`}>
                            {guess.player.name}
                        </div> */}
                        <div className={`guess-cell ${guess.matches.teamName ? 'correct' : 'incorrect'}`}>
                            {guess.player.teamName}
                        </div>
                        <div className={`guess-cell ${guess.matches.position ? 'correct' : 'incorrect'}`}>
                            {getPositionName(guess.player.position)}
                        </div>
                        <div className={`guess-cell ${guess.matches.marketValue === 'correct' ? 'correct' : 'indicator'}`}>
                            {formatMarketValue(guess.player.marketValue)}
                            {guess.matches.marketValue !== 'correct' && (
                                <span className="arrow">
                                    {guess.matches.marketValue === 'higher' ? '↓' : '↑'}
                                </span>
                            )}
                        </div>
                        <div className={`guess-cell ${guess.matches.number ? 'correct' : 'incorrect'}`}>
                            #{guess.player.number}
                        </div>
                        <div className={`guess-cell ${guess.matches.points === 'correct' ? 'correct' : 'indicator'}`}>
                            {guess.player.totalPoints}
                            {guess.matches.points !== 'correct' && (
                                <span className="arrow">
                                    {guess.matches.points === 'higher' ? '↓' : '↑'}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {gameWon && (
                <div className="victory-message">
                    Congratulations! You found the player!
                </div>
            )}
        </div>
    );
}

export default PlayerGuess;