"""
This is the main file for the program which, when triggered,
gets data from the transit API and stores it in temporary JSON files,
and moves the data to the Amazon RDS database.
"""

from zoneinfo import ZoneInfo

import requests
from dotenv import dotenv_values

from transit_track.fetch import save_new_data
from transit_track.load import load_logs


def main():
    # route_url = "https://pt.mytransitride.com/api/Route"
    status_url = "https://pt.mytransitride.com/api/VehicleStatuses"

    dotenv_path = "../../.env"

    with open("patterns.txt") as patterns:
        patternIds = patterns.read()

    parameters = {
        "patternIds": patternIds
    }

    server_time = requests.get("https://pt.mytransitride.com/api/SystemSettings").json()["currentServerTime"]

    PTBO_tz = ZoneInfo("America/Toronto")

    current_logs_params = [PTBO_tz, server_time, parameters, status_url]

    try:
        save_new_data(current_logs_params)

        load_logs(dotenv_path, current_logs_params)
    except RuntimeError as e:
        print(e)

if __name__ == "__main__":
    main()