import re
import os

def add_supabase_scripts():
    """Add Supabase config and contact form script to all HTML files"""
    
    base_dir = r"c:\Users\Mary\Desktop\rezolv eroare\da\jasminadenner.com"
    
    # Scripts to add before </head>
    supabase_scripts = """<!-- Supabase -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="assets/js/supabase-config.js"></script>
<script src="assets/js/contact-form-supabase.js"></script>"""
    
    files_updated = 0
    
    # Walk through all HTML files
    for root, dirs, files in os.walk(base_dir):
        for file in files:
            if file.endswith('.html') and file != 'external.html':
                file_path = os.path.join(root, file)
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    original_content = content
                    
                    # Check if scripts are not already added
                    if 'contact-form-supabase.js' not in content:
                        # Determine the correct path based on file location
                        relative_path = os.path.relpath(base_dir, os.path.dirname(file_path))
                        if relative_path == '.':
                            script_path = 'assets/js/'
                        else:
                            # Count directory levels
                            levels = relative_path.count(os.sep)
                            script_path = '../' * levels + 'assets/js/'
                        
                        # Adjust script paths
                        adjusted_scripts = supabase_scripts.replace('assets/js/', script_path)
                        
                        # Add scripts before </head> or at the end of head section
                        if '</head>' in content:
                            content = content.replace('</head>', f'{adjusted_scripts}\n</head>')
                        elif '<body>' in content:
                            content = content.replace('<body>', f'{adjusted_scripts}\n<body>')
                        
                        # Only write if changes were made
                        if content != original_content:
                            with open(file_path, 'w', encoding='utf-8') as f:
                                f.write(content)
                            
                            files_updated += 1
                            print(f"✓ {file}")
                
                except Exception as e:
                    print(f"✗ Error processing {file}: {e}")
    
    print(f"\n{'='*70}")
    print(f"Files updated: {files_updated}")
    print(f"\nSupabase scripts added to all pages!")

if __name__ == "__main__":
    add_supabase_scripts()
