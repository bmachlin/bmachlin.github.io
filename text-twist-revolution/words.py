import json, requests

url = "https://api.dictionaryapi.dev/api/v2/entries/en/"

words = {}
with open("words.txt", "r+") as f:
    lines = [l.strip() for l in f.readlines()]
lines.sort()

for l in lines:
    # response = requests.get(url+"l").ok
    # print(l, response)
    # if response:
    words[l.lower()] = 1

output = json.dumps(words)
with open("words.json", "w") as outfile:
    outfile.write(output)