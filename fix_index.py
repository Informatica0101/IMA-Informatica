import re

with open('index.html', 'r') as f:
    content = f.read()

# 1. Update Hero section for personalized welcome
content = re.sub(
    r'<h1 class="text-4xl md:text-6xl font-black text-gray-800 mb-6 leading-tight">.*?</h1>',
    '<h1 class="text-4xl md:text-6xl font-black text-gray-800 mb-6 leading-tight">¡Bienvenido, <span id="hero-user-name">Estudiante</span>!</h1>',
    content, flags=re.DOTALL
)

# 2. Add "Mi Perfil" to header in index.html
header_nav = '<a href="index.html" class="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">Inicio</a>'
if 'id="open-profile-btn"' not in content:
    content = content.replace(header_nav, header_nav + '\n                <button id="open-profile-btn" class="hidden text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200 focus:outline-none">Mi Perfil</button>')

with open('index.html', 'w') as f:
    f.write(content)

# Update js/index-ui.js to handle personalized name
with open('js/index-ui.js', 'r') as f:
    js = f.read()

personalized_logic = '''
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const heroName = document.getElementById('hero-user-name');
    const profileBtn = document.getElementById('open-profile-btn');
    if (currentUser && currentUser.nombre) {
        if (heroName) heroName.textContent = currentUser.nombre;
        if (profileBtn) {
            profileBtn.classList.remove('hidden');
            profileBtn.onclick = () => {
                window.location.href = currentUser.rol === 'Profesor' ? 'teacher-dashboard.html' : 'student-dashboard.html';
            };
        }
    }
'''
js = js.replace('window.setupIndexUI = function() {', 'window.setupIndexUI = function() {' + personalized_logic)

with open('js/index-ui.js', 'w') as f:
    f.write(js)

print("Index personalized and profile button added.")
