import os

filepath = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report\social-connection-and-longevity\index.html'

# Read the file
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Read the exact text from the extracted file
with open('empathy_text.txt', 'r', encoding='utf-8') as f:
    old_text = f.read()

new_text = 'Tu ai mai auzit de divizorii proprii și improprii? Dacă nu, hai să aflăm împreună'

# Replace
if old_text in content:
    content = content.replace(old_text, new_text)
    
    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("✓ Text înlocuit cu succes!")
else:
    print("✗ Textul nu a fost găsit în fișier")
