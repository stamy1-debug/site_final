import os

filepath = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report\social-connection-and-longevity\index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Find "data scientist"
idx = content.find('data scientist')
if idx != -1:
    excerpt = content[idx-20:idx+30]
    print("Around 'data scientist':")
    print(repr(excerpt))
    
    # Check quotes
    for i, char in enumerate(excerpt):
        if char in '""\'\'""':
            print(f"Position {i}: '{char}' = U+{ord(char):04X}")
