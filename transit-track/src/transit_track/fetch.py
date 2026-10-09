import json
from datetime import datetime, timezone

import pandas as pd
import requests


def get_current_logs(city_tz,server_time,parameters,status_url):

    vehicle_logs = []

    print(f"Server Time: {server_time}")

    current_logs_json = requests.get(status_url, params = parameters).json()

    for i in range(len(current_logs_json)):
        last_update = datetime.fromisoformat(current_logs_json[i]["lastUpdate"]).replace(tzinfo=timezone.utc)
        last_update = last_update.astimezone(city_tz)
        vehicle_logs.append(
            {
                "pattern_id": current_logs_json[i]["patternId"],
                "vehicle_id": current_logs_json[i]["vehicleId"],
                "headsign_text": current_logs_json[i]["headsignText"],
                "velocity": current_logs_json[i]["velocity"],
                "bearing": current_logs_json[i]["bearing"],
                "lat": current_logs_json[i]["lat"],
                "lng": current_logs_json[i]["lng"],
                "last_update": last_update.isoformat(),
                "time_polled": server_time
            }
        )

    return vehicle_logs


# Something like:

def save_new_data(city_tz,server_time,parameters,status_url):
    # get_current_logs()

    with open("data/incoming_data.json", "w+") as f:
        # incoming_data = convert_logs_to_str(get_current_logs())
        json.dump(get_current_logs(city_tz,server_time,parameters,status_url), f, indent = 2)

    new_log = pd.read_json("data/incoming_data.json")

    log = pd.read_json("data/full_logs.json")

    new_log["last_update"] = pd.to_datetime(new_log["last_update"], utc=True) - pd.Timedelta(hours=4)
    new_log["time_polled"] = pd.to_datetime(new_log["time_polled"], utc=True)
    log["last_update"] = pd.to_datetime(log["last_update"], utc=True)
    log["time_polled"] = pd.to_datetime(log["time_polled"], utc=True)



    log["vehicle_id"] = log["vehicle_id"].astype("category")
    log["pattern_id"] = log["pattern_id"].astype("category")
    
    for vehicle_id in new_log["vehicle_id"].values:
        print(f"This is the examined v_id from incoming: {vehicle_id}\n")

        row_to_add = new_log.loc[new_log["vehicle_id"] == vehicle_id]
        print(f"This is the full row:\n {row_to_add}\nEnd of output\n\n")

        # if this is a new bus reporting data:
        if vehicle_id not in log["vehicle_id"].values:
            print("THIS SEEMS TO BE A NEW V_ID\n")
            print(f"These are all the v_ids in log:\n{log["vehicle_id"].values}\n End of output.\n\n")
            # append its data
            log = pd.concat([log, row_to_add], ignore_index=True)
        # elif this bus has already been reporting
        # if the data is new
        else:
            print("THIS SEEMS TO BE AN EXISTING V_ID\n")
            vehicle_most_recent = log.query("vehicle_id == @vehicle_id").nlargest(1, "last_update")
            print(f"This is the most recent v_id of same type in log: {vehicle_most_recent}\n")

            # vehicle in list, but differnt update tiems
            if row_to_add["last_update"].iloc[0] > vehicle_most_recent["last_update"].iloc[0]:
                log = pd.concat([log, row_to_add], ignore_index=True)
                print("WE ARE UPDATING LOG BECAUSE NEW DATA HAS MORE RECENT UPDATE TIME\n")
            # if update time is same, ignore
            else:
                print("WE ARE NOT UPDATING LOG.\n")
    
    log.to_json("data/full_logs.json", orient="records", indent = 2, date_format = "iso", index = False)
    
    print("Log File Updated")
