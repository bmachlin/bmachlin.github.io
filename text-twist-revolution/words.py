import json
with open("wordz.json", "r+", encoding="utf-8") as f:
    words = json.load(f)
d = {}
for word in words:
    d[word["word"]] = 1
output = json.dumps(d)
with open("words.json", "w") as outfile:
    outfile.write(output)