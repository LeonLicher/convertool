import json
import logging
import os

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Get absolute path for the JSON file
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_FILE = os.path.join(SCRIPT_DIR, 'all_players.json')

def test_json_write():
    # Test data
    test_data = {
        "players": {
            "1": {
                "id": 1,
                "name": "Test Player",
                "teamId": 1,
                "teamName": "Test Team"
            }
        },
        "valid_team_ids": [1]
    }

    try:
        # Write test data with absolute path
        logging.info(f"Writing to file: {JSON_FILE}")
        with open(JSON_FILE, 'w+', encoding='utf-8') as f:
            json.dump(test_data, f, ensure_ascii=False, indent=2)
            f.flush()
            os.fsync(f.fileno())
        logging.info("Test data written successfully")

        # Verify file exists and has content
        if os.path.exists(JSON_FILE):
            size = os.path.getsize(JSON_FILE)
            logging.info(f"File exists with size: {size} bytes")
        else:
            logging.error("File doesn't exist after writing!")

        # Read it back to verify
        with open(JSON_FILE, 'r', encoding='utf-8') as f:
            read_data = json.load(f)
            print("Read data from file:")
            print(json.dumps(read_data, indent=2))
            
        logging.info("Data read back successfully")

        # Verify data matches
        assert read_data == test_data, "Written and read data don't match"
        logging.info("Data verification successful")

    except Exception as e:
        logging.error(f"Error during test: {str(e)}")
        logging.error(f"Current working directory: {os.getcwd()}")
        raise

if __name__ == "__main__":
    test_json_write()