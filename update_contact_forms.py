import re
import os

def update_forms():
    """Update all HTML forms to remove Formspree and change success message"""
    
    base_dir = r"c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com"
    
    # Pattern to find: form action with formspree
    formspree_pattern = r"<form action='https://formspree\.io/f/mrzgenqn' method='POST'>"
    # Replace with: form without action
    formspree_replacement = "<form data-component='contact-form'>"
    
    # Pattern to find: old success message
    old_message = "Thank you so much for your message! Jasmina will get back to you soon."
    # Replace with: new message
    new_message = "Mulțumesc pentru mesaj! Îți voi răspunde în curând."
    
    # Also replace longer version in contact page
    old_message_long = "Thank you so much for your message! Jasmina will get back to you soon. Have more to say? Feel free to write another message below!"
    new_message_long = "Mulțumesc pentru mesaj! Îți voi răspunde în curând. Ai mai mult de spus? Trimite un alt mesaj mai jos!"
    
    files_updated = 0
    
    # Walk through all HTML files
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    original_content = content
                    
                    # Replace Formspree action
                    content = re.sub(formspree_pattern, formspree_replacement, content)
                    
                    # Replace success messages
                    content = content.replace(old_message_long, new_message_long)
                    content = content.replace(old_message, new_message)
                    
                    # Only write if changes were made
                    if content != original_content:
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(content)
                        
                        files_updated += 1
                        print(f"✓ {file_path}")
                
                except Exception as e:
                    print(f"✗ Error processing {file_path}: {e}")
    
    print(f"\n{'='*70}")
    print(f"Files updated: {files_updated}")
    print(f"\nAll forms now save to Supabase!")
    print(f"Success message updated to Romanian.")

if __name__ == "__main__":
    update_forms()
