/**
 * Shopify Theme Asset: customer-account.js
 * Encapsulates client-side customer data isolation behaviors.
 */

(function() {
  'use strict';

  // Helper: Calculated baby age
  function calculateBabyAge(birthdateStr) {
    if (!birthdateStr) return '';
    var birth = new Date(birthdateStr);
    var now = new Date();
    if (isNaN(birth.getTime())) return '';
    
    var diffYears = now.getFullYear() - birth.getFullYear();
    var diffMonths = now.getMonth() - birth.getMonth();
    var diffDays = now.getDate() - birth.getDate();

    if (diffDays < 0) {
      diffMonths -= 1;
      var prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      diffDays += prevMonth.getDate();
    }
    if (diffMonths < 0) {
      diffYears -= 1;
      diffMonths += 12;
    }

    var parts = [];
    if (diffYears > 0) parts.push(diffYears + " Yr" + (diffYears > 1 ? 's' : ''));
    if (diffMonths > 0) parts.push(diffMonths + " Mo" + (diffMonths > 1 ? 's' : ''));
    if (diffDays > 0 && diffYears === 0) parts.push(diffDays + " Day" + (diffDays > 1 ? 's' : ''));

    return parts.length > 0 ? parts.join(' ') : 'Newborn';
  }

  // Bind forms and metafield mock data on load
  document.addEventListener('DOMContentLoaded', function() {
    console.log('[Shopify Theme] Isolated parenting account assets registered successfully.');
    
    var targetDiv = document.getElementById('shopify-baby-profiles-target');
    if (targetDiv) {
      var email = window.Shopify && window.Shopify.customer ? window.Shopify.customer.email.toLowerCase() : 'parent@example.com';
      var registerKey = 'fc_registered_users';
      var registeredUsers = JSON.parse(localStorage.getItem(registerKey) || '[]');
      
      var matchedUser = registeredUsers.find(function(u) {
        return u.email.toLowerCase() === email;
      });

      var kids = matchedUser && matchedUser.children ? matchedUser.children : [];

      if (kids.length === 0) {
        targetDiv.innerHTML = `
          <div class="col-12 py-5 bg-white border rounded text-center">
            <p className="text-muted">No child records logged in metafields yet.</p>
          </div>
        `;
        return;
      }

      var html = '';
      kids.forEach(function(c) {
        var ageText = calculateBabyAge(c.birthdate);
        html += `
          <div class="col-12 col-md-6 mb-3">
            <div class="card p-4 bg-white border rounded">
              <h4 class="font-bold my-0 h6">${c.name} (${c.gender})</h4>
              <p class="text-xs text-muted mb-1">Birthdate: ${c.birthdate}</p>
              <p class="text-xs text-orange font-bold font-weight-bold">Age: ${ageText}</p>
            </div>
          </div>
        `;
      });
      targetDiv.innerHTML = html;
    }
  });

})();
