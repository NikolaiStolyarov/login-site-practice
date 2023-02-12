//console.log(3)
//console.log(2)

document.querySelectorAll('input[name="username"]').forEach(input => {
  input.addEventListener('click', function() {
    this.value = '';
  });
});
document.querySelectorAll('input[name="userpass"]').forEach(input => {
  input.addEventListener('click', function() {
    this.value = '';
    this.type = 'password';
  });
});

document.querySelector(".button-login").addEventListener("click", function() {
  document.querySelector(".myInput-user").value = "Введите свое имя";
  document.querySelector(".myInput-password").value = "Введите свой пароль";
  document.querySelector(".myInput-password").type = 'text';
});