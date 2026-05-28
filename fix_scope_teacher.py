with open('js/teacher.js', 'r') as f:
    content = f.read()

# Fix the split that happened when I appended modules
# Find the line '    fetchTeacherActivity();' followed by '});'
# and move the rest of the file inside

parts = content.split('    fetchTeacherActivity();\n});')
if len(parts) > 1:
    new_content = parts[0] + parts[1] + '\n    fetchTeacherActivity();\n});'
    with open('js/teacher.js', 'w') as f:
        f.write(new_content)
    print("Fixed Teacher JS scope.")
else:
    print("Split pattern not found.")
