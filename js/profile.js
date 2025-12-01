const API_URL = window.location.origin;

// Load user profile from backend
async function loadUserProfile() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    alert('Please login first');
    window.location.href = 'login.html';
    return;
  }
  
  try {
    const response = await fetch('http://localhost:5000/api/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.clear();
        window.location.href = 'login.html';
        return;
      }
      throw new Error('Failed to load profile');
    }
    
    const user = await response.json();
    
    // Fill in profile fields
    const nameParts = user.full_name?.split(' ') || ['', ''];
    document.getElementById('firstName').value = nameParts[0] || '';
    document.getElementById('lastName').value = nameParts[1] || '';
    document.getElementById('displayName').value = user.username || '';
    document.getElementById('accEmail').value = user.email || '';
    document.getElementById('bio').value = user.bio || '';
    
  } catch (error) {
    console.error('Error loading profile:', error);
    alert('Error loading profile. Please try again.');
  }
}

// Save profile changes
async function saveProfile() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    alert('Please login first');
    window.location.href = 'login.html';
    return;
  }
  
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const bio = document.getElementById('bio').value;
  
  try {
    const response = await fetch('http://localhost:5000/api/users/profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        fullName: `${firstName} ${lastName}`.trim(),
        bio: bio
      })
    });
    
    if (response.ok) {
      alert('Profile updated successfully!');
      loadUserProfile(); // Reload profile
    } else {
      alert('Failed to update profile');
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    alert('Error saving profile. Please try again.');
  }
}

// Load profile on page load
document.addEventListener('DOMContentLoaded', function() {
  loadUserProfile();
  
  // Add click event to save button
  const saveBtn = document.querySelector('.action-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', function(e) {
      e.preventDefault();
      saveProfile();
    });
  }
});

    // Tab switching logic + animations
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.querySelectorAll('.tab-content').forEach(cont => cont.classList.remove('active'));
        document.getElementById(btn.dataset.tab).classList.add('active');
      });
    });

    // Button animation on click
    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.addEventListener('mousedown', function () {
        btn.style.transform = 'scale(0.92)';
      });
      btn.addEventListener('mouseup', function () {
        btn.style.transform = 'scale(1)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transform = 'scale(1)';
      });
    });

    // Animate tab content on reveal (fade in effect via class)
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', function () {
        const activeTab = document.getElementById(btn.dataset.tab);
        activeTab.classList.remove('active');
        setTimeout(() => activeTab.classList.add('active'), 42);
      });
    });

    // Switches: add a ripple effect on toggle
    document.querySelectorAll('.switch input[type="checkbox"]').forEach(sw => {
      sw.addEventListener('change', function () {
        const slider = sw.nextElementSibling;
        slider.style.boxShadow = '0 0 0 9px #dab0783e';
        setTimeout(()=>{ slider.style.boxShadow=''; }, 210);
      });
    });

    // Load and save user profile
(async function initProfile() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    alert('Please login first');
    window.location.href = 'login.html';
    return;
  }
  
  // Load profile
  try {
    const response = await fetch('http://localhost:5000/api/users/profile', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      localStorage.clear();
      window.location.href = 'login.html';
      return;
    }
    
    const user = await response.json();
    const nameParts = user.full_name?.split(' ') || ['', ''];
    
    // Fill form fields
    if (document.getElementById('firstName')) 
      document.getElementById('firstName').value = nameParts[0] || '';
    if (document.getElementById('lastName')) 
      document.getElementById('lastName').value = nameParts[1] || '';
    if (document.getElementById('displayName')) 
      document.getElementById('displayName').value = user.username || '';
    if (document.getElementById('accEmail')) 
      document.getElementById('accEmail').value = user.email || '';
    if (document.getElementById('bio')) 
      document.getElementById('bio').value = user.bio || '';
    
  } catch (error) {
    console.error('Error loading profile:', error);
  }
  
  // Save profile function
  window.saveProfile = async function() {
    const firstName = document.getElementById('firstName')?.value || '';
    const lastName = document.getElementById('lastName')?.value || '';
    const bio = document.getElementById('bio')?.value || '';
    
    try {
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fullName: `${firstName} ${lastName}`.trim(),
          bio: bio
        })
      });
      
      if (response.ok) {
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile');
    }
  };
  
  // Add click event to save button
  const saveBtn = document.querySelector('.action-btn') || document.querySelector('.save-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', function(e) {
      e.preventDefault();
      saveProfile();
    });
  }
})();

  