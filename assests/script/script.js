function showContent(contentId, menuItem) {
      
    const contents = document.querySelectorAll('.content');
    contents.forEach(content => content.classList.remove('active'));

    
    document.getElementById(contentId).classList.add('active');

    const menuItems = document.querySelectorAll('.side-menu a');
    menuItems.forEach(item => item.classList.remove('active'));

    
    menuItem.classList.add('active');
  }

  function togglePopup() {
    const popup = document.getElementById('popup');
    const overlay = document.getElementById('popupOverlay');
    popup.classList.toggle('active');
    overlay.classList.toggle('active');
  }