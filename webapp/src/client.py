#Test python client for the flask server
import requests
import json
#
url = 'http://localhost:5000/captions'
data = {"video_id": "mc979OhitAg"}
headers = {'Content-type': 'application/json'}
response = requests.post(url, data=json.dumps(data), headers=headers)

print(response.status_code)
print(response.text)

