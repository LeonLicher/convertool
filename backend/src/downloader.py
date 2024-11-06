import requests
import json
import time
import logging
import os

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Constants
BASE_URL = "https://api.kickbase.com/competition/teams/{}/players"
BEARER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrYi5uYW1lIjoiTGVvbkxNZXNzaSIsImtiLnVpZCI6IjMxOTMxNjMiLCJrYi5yIjoiMTgiLCJrYi5hIjoiMiIsImtiLnAiOiIxLDIsNTAwLDEwMDAsMTAwMSw0LDUsNTAxLDUwMSw4LDksMTAsMTIsMyw3LDExLDEzIiwiaWF0IjoxNzI5NDU3NDYxLCJuYmYiOjE3Mjk0NTc0NjEsImV4cCI6MTczMDA2NTg2MSwiaXNzIjoiaHR0cDovL2tpY2tiYXNlLmNvbSIsImF1ZCI6ImtpY2tiYXNlIn0.uaD2EXcNXAPw3YY5M2VCjGab-Ey6nfNWsySlNvKsoNE"
HEADERS = {
    "Authorization": f"Bearer {BEARER_TOKEN}",
    "Content-Type": "application/json"
}

# Get absolute path for the JSON file
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_FILE = os.path.join(SCRIPT_DIR, 'all_players.json')

def fetch_players(team_id):
    url = BASE_URL.format(team_id)
    logging.info(f"Fetching data for team ID: {team_id}")
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        logging.info(f"Successfully fetched data for team ID: {team_id}")
        return response.json()
    else:
        logging.warning(f"Failed to fetch data for team {team_id}. Status code: {response.status_code}")
        return None

def save_data(all_players, valid_team_ids):
    logging.info(f"Saving data to: {JSON_FILE}")
    data = {
        "players": all_players,
        "valid_team_ids": valid_team_ids
    }
    try:
        with open(JSON_FILE, 'w+', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            f.flush()
            os.fsync(f.fileno())
        
        # Verify file was written
        if os.path.exists(JSON_FILE):
            size = os.path.getsize(JSON_FILE)
            logging.info(f"File saved successfully. Size: {size} bytes")
        else:
            logging.error("File doesn't exist after saving!")
            
    except Exception as e:
        logging.error(f"Error saving data: {str(e)}")

def collect_player_data():
    all_players = {}
    # Known valid team IDs
    valid_team_ids = [2,3,4,5,7,8,10,11,13,14,15,18,24,39,40,43,50,51]

    logging.info("Starting to collect player data")
    logging.info(f"Will process {len(valid_team_ids)} known teams")

    for team_id in valid_team_ids:
        logging.info(f"\n{'='*50}")
        logging.info(f"Processing team ID: {team_id}")
        players_data = fetch_players(team_id)
        
        if players_data and 'p' in players_data:
            team_name = players_data['p'][0]['teamName'] if players_data['p'] else "Unknown"
            logging.info(f"Team: {team_name} (ID: {team_id})")
            logging.info(f"Found {len(players_data['p'])} players")
            
            # Log all players being processed
            logging.info("Players in this team:")
            for player in players_data['p']:
                logging.info(f"  - {player['firstName']} {player['lastName']} ({player['position']})")
                all_players[player['id']] = {
                    'id': player['id'],
                    'name': f"{player['firstName']} {player['lastName']}",
                    'teamId': player['teamId'],
                    'teamName': player['teamName'],
                    'position': player['position'],
                    'marketValue': player['marketValue'],
                    'averagePoints': player['averagePoints'],
                    'totalPoints': player['totalPoints'],
                    'number' : player['number']
                }
            
            # Save data after processing each team
            save_data(all_players, valid_team_ids)
            logging.info(f"Saved data for {team_name}. Total players in database: {len(all_players)}")
        else:
            logging.error(f"Failed to fetch data for known team ID: {team_id}")
        
        logging.info("Waiting before next request")
        time.sleep(0.2)

    logging.info(f"\n{'='*50}")
    logging.info("Data collection completed")
    logging.info(f"Teams processed: {len(valid_team_ids)}")
    logging.info(f"Total players collected: {len(all_players)}")
    
    return all_players, valid_team_ids

def main():
    logging.info("Starting the script")
    all_players, valid_team_ids = collect_player_data()
    
    logging.info(f"Total number of players collected: {len(all_players)}")

    # Final save of all player data
    save_data(all_players, valid_team_ids)

    logging.info("Script execution completed")

if __name__ == "__main__":
    main()