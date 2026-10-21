"""
This is the main file for the program which, when triggered,
gets data from the transit API and stores it in temporary JSON files,
and moves the data to the Amazon RDS database.
"""

import argparse
import time
from zoneinfo import ZoneInfo

import requests

from transit_track.fetch import save_new_data
from transit_track.load import load_logs


def main():

    parser = argparse.ArgumentParser(
        description="Fetches data from API and loads into RDS.",
    )

    parser.add_argument(
        "duration",
        type=int,
        help="Length (in minutes) of the fetch-load loop.",
        default=None
    )

    duration = parser.parse_args().duration

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

    start_time = time.time()

    print(f"Specified duration is {duration} minutes.")
    
    step = 0

    if duration:
        print(f"Step: {step}")
        time_elapsed = time.time() - start_time
        while time_elapsed < duration:
            print(f"Time elapsed: {time_elapsed} minutes.")
            try:
                save_new_data(current_logs_params)

                load_logs(dotenv_path, current_logs_params)

                step = step + 1
            except RuntimeError as e:
                print(e)

if __name__ == "__main__":
    main()