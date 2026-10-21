import pandas as pd
import psycopg
from dotenv import dotenv_values

from transit_track.fetch import get_current_logs


def load_logs(dotenv_path, current_logs_params):

    records = get_current_logs(*current_logs_params)

    creds = dotenv_values(dotenv_path)

    with psycopg.connect(
        host=creds.get("DB_HOST"),
        port=creds.get("DB_PORT"),
        dbname=creds.get("DB_NAME"),
        user=creds.get("DB_USERNAME"),
        password=creds.get("DB_PASSWORD"),
        options="-c timezone=America/Toronto",
    ) as db_conn, db_conn.cursor() as cur:
        cur.executemany(
            """
                    INSERT INTO positions (vehicle_id, pattern_id, velocity, bearing,
                    lat, lng, last_update, last_polled)

                    VALUES ( %(vehicle_id)s, %(pattern_id)s, %(velocity)s, %(bearing)s,
                    %(lat)s, %(lng)s, %(last_update)s, %(time_polled)s )
                    
                    ON CONFLICT (vehicle_id, last_update) DO NOTHING

                    RETURNING vehicle_id, pattern_id, last_update;
                """
        , records, returning = True)

        new_rows = []

        while True:
            rows = cur.fetchall()

            if rows:
                new_rows.append(rows)

            if not cur.nextset():
                break

        new_rows_df = pd.DataFrame(new_rows)

        if not new_rows_df.empty:
            print(new_rows_df)

        cur.execute("SELECT count(*) FROM positions")
        print("Rows in positions:", cur.fetchone()[0])
