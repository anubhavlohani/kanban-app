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
    </div>

    <div class="mb-3">
      <input type="checkbox" class="form-check-input" id="id_check1" required>
      <label for="check1" class="form-check-label">Confirm</label>
    </div>
    
    <button type="submit" class="btn btn-outline-primary">Submit</button>
  </form>
  `,

  data() {
    return {
      username: null,
      validUsername: false,
      usernameErrors: [],
      password: null,
      validPassword: false,
      passwordErros: [],
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
    }
  }
}

export default login