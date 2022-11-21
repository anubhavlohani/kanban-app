const login = {
  template: `
    <form class="container" method="post">
    <h3 class="mb-3 center">Login</h3>
    
    <div class="mb-3">
      <label for="username" class="form-label">Username</label>
      <input id="username" class="form-control" v-model="username" type="text" name="username">
      <ul v-if="usernameErrors.length">
        <li v-for="error in usernameErrors" class="error-condition">
          {{ error }}
        </li>
      </ul>
    </div>

    <div class="mb-3">
      <label for="password" class="form-label">Password</label>
      <input id="password" class="form-control" v-model="password" type="password" name="password">
      <ul v-if="passwordErrors.length">
        <li v-for="error in passwordErrors" class="error-condition">
          {{ error }}
        </li>
      </ul>
    </div>

    <div class="mb-3">
      <input type="checkbox" class="form-check-input" id="id_check1" required>
      <label for="check1" class="form-check-label">Confirm</label>
    </div>
    
    <button @click="userLogin" class="btn btn-outline-primary">Submit</button>
  </form>
  `,

  data() {
    return {
      username: null,
      validUsername: false,
      usernameErrors: [],
      password: null,
      validPassword: false,
      passwordErrors: [],
    }
  },

  methods: {
    userLogin: function(e) {
      e.preventDefault();

      let processServerResponse = (data) => {
        if (data.token) {
          console.log(data.token);
        } else {
          alert(data);
        }
      }

      if (this.validUsername && this.validPassword) {
        fetch('http://localhost:8080/login', {
          method: 'POST',
          headers: {
            'Authorization': 'Basic ' + btoa(`${this.username}:${this.password}`),
          }
        }).then(res => res.json()).then(data => processServerResponse(data)).catch(error => alert(error))
      }
    }
  },

  watch: {
    username: function () {
      this.validUsername = true
      this.usernameErrors = []

      if (this.username.trim().length == 0) {
        this.validUsername = false
        this.usernameErrors.push('username field cannot be empty')
      } else {
        var re = RegExp("[^\\w]")
        if (this.username.length < 5 || this.username[0] == '_' || re.test(this.username)) {
          this.validUsername = false
          this.usernameErrors.push('username invalid')
        }
      }
    },
    password: function() {
      this.validPassword = true
      this.passwordErrors = []

      if (this.password.length == 0) {
        this.validPassword = false
        this.passwordErrors.push('password field cannot be empty')
      } else {
        var re1 = RegExp("[a-zA-Z]")
        var re2 = RegExp("[0-9]")
        if (this.password.length < 8 || !re1.test(this.password) || !re2.test(this.password)) {
          this.validPassword = false
          this.passwordErrors.push('password invalid')
        }
      }
    }
  }
}

export default login