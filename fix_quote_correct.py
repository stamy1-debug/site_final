import os

# Directory containing the HTML files
base_dir = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report'

# The exact old text from HTML (single line with newlines as \n characters)
old_text = '''"That brain of mine is something more than merely mortal, as time will show."
— Ada Byron, Lady Lovelace

Centuries before artificial intelligence, before personalized medicine, before the words "data scientist" meant anything at all—Ada Lovelace imagined a world no one else could see.
'''

# New Romanian text
new_text = '"„Matematica este limba cu care Dumnezeu a scris universul."\n'

# Counters
files_updated = 0
total_replacements = 0

# List of subdirectories to process
subdirs = [
    'social-connection-and-longevity',
    'values-and-ethics',
    'public-health-and-policy',
    'personal-identity-and-purpose',
    'mental-and-cognitive-health',
    'economics-of-longevity',
    'body-wellness-and-health',
    'career-and-skills-for-longevity',
    'art-play-and-leisure',
    'AI-and-tech-in-human-potential',
    'The-Power-of-Less-What-Ive-Learned-About-Balance-in-Training',
    'The-End-of-History-Illusion',
    'a-letter-from-Jasmina-on-leading-innovation-and-shaping-the-future'
]

# Process index.html in main directory
main_index = os.path.join(base_dir, 'index.html')
try:
    with open(main_index, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if old_text in content:
        content = content.replace(old_text, new_text)
        with open(main_index, 'w', encoding='utf-8') as f:
            f.write(content)
        files_updated += 1
        total_replacements += 1
        print(f"Updated {main_index}")
except Exception as e:
    print(f"Error processing {main_index}: {e}")

# Process subdirectories
for subdir in subdirs:
    filepath = os.path.join(base_dir, subdir, 'index.html')
    if os.path.exists(filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if old_text in content:
                content = content.replace(old_text, new_text)
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                files_updated += 1
                total_replacements += 1
                print(f"Updated {filepath}")
        except Exception as e:
            print(f"Error processing {filepath}: {e}")

print(f"\nTotal files updated: {files_updated}")
print(f"Total replacements made: {total_replacements}")
