import os

# Directory containing the HTML files
base_dir = r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\the-intelligence-report'

# Read the exact text from the extracted file
with open(r'c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com\extracted.txt', 'r', encoding='utf-8') as f:
    extracted_content = f.read()

# Extract just the quote part (between text-base"> and </p>)
start = extracted_content.find('text-base">')
end = extracted_content.find('</p>')
if start != -1 and end != -1:
    old_text = extracted_content[start+11:end+4]  # Include </p>
    print("Old text to replace:")
    print(repr(old_text))
    print("\n" + "="*70 + "\n")
    
    # Just the inner text without tags
    inner_start = extracted_content.find('>') + 1
    inner_end = extracted_content.find('</p>')
    old_inner_text = extracted_content[inner_start:inner_end]
    print("Inner text:")
    print(repr(old_inner_text))
else:
    print("Could not extract text")
