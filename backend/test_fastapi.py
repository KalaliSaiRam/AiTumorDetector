import requests

res = requests.post("http://127.0.0.1:8000/predict", files={'file': open('test_mri.jpg', 'rb')})
print("STATUS:", res.status_code)
print("BODY:", res.text)
