from celery import Celery
import pandas as pd
import requests
import json

celery = Celery(
    'tasks',
    broker='redis://localhost',
    backend='redis://localhost'
)

@celery.task
def export_list_csv(username, user_lists):
    # create csv
    df = pd.DataFrame.from_records(user_lists)
    file_name = '{}_lists.csv'.format(username)
    df.to_csv(file_name, index=False)

    # alert user
    msg_data = {
        'text': f'{username} your lists have been exported!'
    }
    msg_data = json.dumps(msg_data)
    headers = {'Content-Type': 'application/json; charset=UTF-8'}
    res = requests.post(
        url='https://chat.googleapis.com/v1/spaces/AAAAGoKRVNI/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=ySLsaZytG6dmeHLhVd4oSGgT02hjVMGyi-jQ0zo8E1A%3D',
        headers=headers,
        data=msg_data
    )
    return 'DONE'

# celery -A tasks worker --loglevel=INFO