"""
This is the main file for the program which, when triggered,
gets data from the transit API and stores it in temporary JSON files,
and moves the data to the Amazon RDS database.
"""

from zoneinfo import ZoneInfo

import requests

from transit_track.fetch import save_new_data


def main():
    # route_url = "https://pt.mytransitride.com/api/Route"
    status_url = "https://pt.mytransitride.com/api/VehicleStatuses"

    with open("patterns.txt") as patterns:
        patternIds = patterns.read()

    parameters = {
        "patternIds": patternIds
    }

    server_time = requests.get("https://pt.mytransitride.com/api/SystemSettings").json()["currentServerTime"]

    PTBO_tz = ZoneInfo("America/Toronto")

    try:
        save_new_data(city_tz=PTBO_tz,
                      server_time=server_time,
                      parameters=parameters,
                      status_url=status_url)
    except RuntimeError as e:
        print(e)

if __name__ == "__main__":
    main()