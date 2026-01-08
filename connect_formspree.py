import os
import re

# Formspree endpoint
formspree_endpoint = "https://formspree.io/f/mrzgenqn"

# Directory to search
base_dir = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com'

# Pattern to find and replace form tags
old_form_pattern = r"<form data-component='form' method='post' name='Footer Contact Form'><input type='hidden' name='form-name' value='Footer Contact Form' />"
new_form_tag = f"<form action='{formspree_endpoint}' method='POST'>"

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
                
                original_content = content
                
                # Replace form tag
                content = content.replace(old_form_pattern, new_form_tag)
                
                if content != original_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    files_updated += 1
                    rel_path = os.path.relpath(filepath, base_dir)
                    print(f"✓ {rel_path}")
                    
            except Exception as e:
                print(f"✗ Error: {filepath} - {e}")

print(f"\n{'='*70}")
print(f"Files updated: {files_updated}")
print(f"\nAll forms now connected to Formspree!")
print(f"Endpoint: {formspree_endpoint}")
