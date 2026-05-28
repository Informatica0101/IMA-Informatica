with open('js/teacher.js', 'r') as f:
    content = f.read()

# Find the profile module I added at the end
# and the news module too, they are probably outside the DOMContentLoaded listener

# Let's see the structure
import re

# Find the end of DOMContentLoaded
# It ends with '});' followed by the modules
# I'll just move the end of the file content inside the listener

# The listener starts at line 1.
# Let's find the last '});' that belongs to DOMContentLoaded

# Actually, I'll just rewrite the file properly.
# The original content ended with fetchTeacherActivity(); });

# Let's look for fetchTeacherActivity().then(() => { navigateTo(sectionOperationalDashboard, navDashboard); fetchOperationalDashboard(); });
# which I added in final_refinement.py

pattern = r"fetchTeacherActivity\(\)\.then\(\(\) => \{ navigateTo\(sectionOperationalDashboard, navDashboard\); fetchOperationalDashboard\(\); \}\);\n\}\);"
match = re.search(pattern, content)

if match:
    # Everything after this should be inside the listener
    closing = match.group(0)
    parts = content.split(closing)
    if len(parts) > 1:
        new_content = parts[0] + parts[1] + closing
        with open('js/teacher.js', 'w') as f:
            f.write(new_content)
        print("Moved code inside DOMContentLoaded scope.")
    else:
        print("Closing tag not found correctly.")
else:
    print("Pattern not found.")
