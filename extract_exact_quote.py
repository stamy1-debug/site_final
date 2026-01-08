import os

filepath = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report\social-connection-and-longevity\index.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Find and extract
start_idx = content.find('That brain of mine')
start_idx = start_idx - 1  # Include the opening quote

# Find the closing tag
end_idx = content.find('\n</p>', start_idx)
if end_idx == -1:
    end_idx = content.find('</p>', start_idx)
    
full_text = content[start_idx:end_idx+1]  # Include the final \n

print("Extracted text:")
print(repr(full_text))

# Save it
with open(r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\old_quote_text.txt', 'w', encoding='utf-8') as f:
    f.write(full_text)
    
print("\nSaved to old_quote_text.txt")
print(f"Length: {len(full_text)} characters")
