import os

# Directory containing the HTML files
base_dir = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report'

# Read the exact old text from the file
with open(r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\old_quote_text.txt', 'r', encoding='utf-8') as f:
    old_text = f.read()

print("Old text loaded:")
print(repr(old_text[:100]))
print(f"Length: {len(old_text)}")
print()

# New Romanian text with Romanian quotes
new_text = '„Matematica este limba cu care Dumnezeu a scris universul."\n'

# Counters
files_updated = 0
total_replacements = 0

# Walk through all HTML files
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                if old_text in content:
                    content = content.replace(old_text, new_text)
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    files_updated += 1
                    total_replacements += 1
                    rel_path = os.path.relpath(filepath, base_dir)
                    print(f"✓ {rel_path}")
                    
            except Exception as e:
                print(f"✗ Error: {e}")

print(f"\n{'='*70}")
print(f"Files updated: {files_updated}")
print(f"Replacements made: {total_replacements}")
