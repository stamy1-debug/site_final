import os

filepath = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report\social-connection-and-longevity\index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('That brain of mine')
excerpt = content[idx-5:idx+100]
print("Excerpt:")
print(repr(excerpt))
print("\nFirst character Unicode:")
print(f"Character: {excerpt[0]}")
print(f"Unicode: U+{ord(excerpt[0]):04X}")
