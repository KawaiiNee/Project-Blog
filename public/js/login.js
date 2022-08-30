const form = document.querySelector('[data-form="form"]');
const username = document.querySelector(`input[name="username"]`);

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    // error here
    const { data } = await axios.post(`/login`, {
      username: username.value,
    });

    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("username", data.username);

    location.replace(document.referrer);
  } catch (error) {
    console.log(error.response.data);
  }
});
