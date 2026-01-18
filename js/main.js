/**
 * Global function to close the mobile menu and reset its visual state.
 */
function closeMobileMenu() {
  const overlay = document.getElementById('mobile-menu-overlay');
  const iconPath = document.querySelector('#mobile-menu-icon-svg path');

  if (overlay) {
    overlay.classList.add('hidden');
    overlay.classList.remove('mobile-menu-overlay');
  }

  if (iconPath) {
    iconPath.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
  }

  document.body.style.overflow = '';

  // Reset arrows and submenus if they exist (handled in index.html, but we can attempt to clear classes)
  const arrows = document.querySelectorAll('.rotate-icon');
  arrows.forEach(arrow => arrow.classList.remove('rotated'));

  const containers = document.querySelectorAll('.mobile-menu-item-container');
  containers.forEach(container => {
    container.classList.remove('visible-height');
    container.classList.add('hidden-height');
  });
}
