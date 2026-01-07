import os
import re

def fix_html_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        
        # Fix Google Analytics
        content = re.sub(
            r'src="[./]*external\.html\?link=https://www\.googletagmanager\.com/gtag/js\?id=G-Q78Q7JWNWX"',
            'src="https://www.googletagmanager.com/gtag/js?id=G-Q78Q7JWNWX"',
            content
        )
        
        # Fix SVG xmlns:xlink
        content = re.sub(
            r'xmlns:xlink="[./]*external\.html\?link=http://www\.w3\.org/1999/xlink"',
            'xmlns:xlink="http://www.w3.org/1999/xlink"',
            content
        )
        
        # Fix SVG xmlns
        content = re.sub(
            r'xmlns="[./]*external\.html\?link=http://www\.w3\.org/2000/svg"',
            'xmlns="http://www.w3.org/2000/svg"',
            content
        )
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True
        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

# Process all HTML files
count = 0
fixed = 0
root_dir = r"c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com"

for dirpath, dirnames, filenames in os.walk(root_dir):
    for filename in filenames:
        if filename.endswith('.html') and filename != 'external.html':
            filepath = os.path.join(dirpath, filename)
            count += 1
            if fix_html_file(filepath):
                fixed += 1
                print(f"Fixed: {filepath}")

print(f"\nTotal files processed: {count}")
print(f"Files fixed: {fixed}")
