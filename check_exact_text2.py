import os

# Directory containing the HTML files
base_dir = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report'

# Read one file to see exact characters
sample_file = os.path.join(base_dir, 'social-connection-and-longevity', 'index.html')
with open(sample_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Search for "That brain" with any quotes
import re
matches = re.finditer(r'.{0,5}That brain of mine.{200}', content)
for match in matches:
    excerpt = match.group()
    print("Found text:")
    print(repr(excerpt))
    print("\n" + "="*50 + "\n")
    print("Actual text:")
    print(excerpt)
    break
