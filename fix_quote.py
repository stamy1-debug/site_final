import os
import re

# Directory containing the HTML files
base_dir = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report'

# The exact old text with special characters and line breaks
old_text = '''"That brain of mine is something more than merely mortal, as time will show."
— Ada Byron, Lady Lovelace

Centuries before artificial intelligence, before personalized medicine, before the words "data scientist" meant anything at all—Ada Lovelace imagined a world no one else could see.
'''

# New text with Romanian quote
new_text = '„Matematica este limba cu care Dumnezeu a scris universul."'

# Walk through all HTML files
files_updated = 0
total_replacements = 0

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                
                # Count and replace
                count = content.count(old_text)
                if count > 0:
                    content = content.replace(old_text, new_text)
                    total_replacements += count
                    
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    files_updated += 1
                    print(f"Updated {filepath}: {count} replacements")
                    
            except Exception as e:
                print(f"Error processing {filepath}: {e}")

print(f"\nTotal files updated: {files_updated}")
print(f"Total replacements made: {total_replacements}")
