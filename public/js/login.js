//import axios from 'axios';

const login = async (email, password) => {
  //console.log({ email, password });
  const data = { email, password };
  console.log(data);
  console.log(JSON.stringify(data));
  /*{
    method: 'POST',
    headers: { 'content-type': 'appplication/json' },
    body: JSON.stringify(data),
  }

  fetch('http://127.0.0.1:3000/api/v1/users/signup', {
    method: 'POST',
    headers: { 'content-type': 'appplication/json' },
    body: JSON.stringify(data),
  })
    .then(() => {
      console.log('logged in');
    })
    .catch((err) => {
      console.log(err.message);
      console.log('E no work');
    });*/

  try {
    const res = await axios({
      method: 'post',
      url: 'http://localhost:3000/api/v1/users/logIn',
      data: {
        email,
        password,
      },
    });
    console.log(res);
  } catch (res) {
    console.log(res.response.data.message);
  }
};

document.querySelector('.form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  login(email, password);
});
