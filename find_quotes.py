import os

filepath = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report\social-connection-and-longevity\index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

idx = content.find('That brain of mine')
excerpt = content[idx-1:idx+150]
print("Excerpt with quotes:")
print(repr(excerpt))

# Check each character
for i, char in enumerate(excerpt[:50]):
    if char in '""\'"\'':
        print(f"Position {i}: '{char}' = U+{ord(char):04X}")
