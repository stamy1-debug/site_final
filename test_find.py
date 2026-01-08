import os

# Test with one specific file
filepath = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report\social-connection-and-longevity\index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Test different versions of the text
test_strings = [
    '"That brain of mine is something more than merely mortal, as time will show."',
    'That brain of mine',
    '— Ada Byron',
    'data scientist'
]

for test_str in test_strings:
    if test_str in content:
        print(f"✓ Found: {test_str[:30]}")
        # Find context
        idx = content.find(test_str)
        print(f"  Context: {repr(content[idx-20:idx+len(test_str)+20])}")
        print()
    else:
        print(f"✗ NOT Found: {test_str[:30]}")
