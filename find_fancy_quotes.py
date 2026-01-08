import os

filepath = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report\social-connection-and-longevity\index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Find using fancy quotes
start_idx = content.find('"That brain of mine')  # U+201C left double quotation mark
if start_idx == -1:
    print("Could not find with U+201C!")
    # Try regular quote
    start_idx = content.find('"That brain of mine')
    if start_idx == -1:
        print("Could not find with regular quote either!")
        # Find just the text
        start_idx = content.find('That brain of mine')
        if start_idx != -1:
            # Check what's before it
            char_before = content[start_idx-1]
            print(f"Found 'That brain of mine'")
            print(f"Character before: '{char_before}' = U+{ord(char_before):04X}")
            
            # Extract a larger context
            excerpt = content[start_idx-10:start_idx+200]
            print("\nContext:")
            print(repr(excerpt))
