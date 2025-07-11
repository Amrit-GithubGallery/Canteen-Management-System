function showTab(tabName) {
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  document.querySelector(`.tab[onclick="showTab('${tabName}')"]`).classList.add('active');

  document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
  document.getElementById(`${tabName}-form`).classList.add('active');
}
