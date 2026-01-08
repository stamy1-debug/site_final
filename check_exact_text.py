import os

# Directory containing the HTML files
base_dir = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report'

# Read one file to see exact characters
sample_file = os.path.join(base_dir, 'social-connection-and-longevity', 'index.html')
with open(sample_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Find the text and print surrounding characters with their repr
start_idx = content.find('"That brain of mine')
if start_idx != -1:
    end_idx = content.find('</p>', start_idx)
    excerpt = content[start_idx:end_idx+4]
    print("Found text:")
    print(repr(excerpt))
    print("\n" + "="*50 + "\n")
    print("Actual text:")
    print(excerpt)
else:
    print("Text not found")
