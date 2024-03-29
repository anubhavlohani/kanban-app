const register = {
  template: `
  <div class="container">
    <h3 class="mb-3 center">Create Account</h3>
    
    <form id="app" action="#" method="post">
      <div class="mb-3">
        <label for="name" class="form-label">Name</label>
        <input id="name" class="form-control" v-model="name" type="text" name="name">
        <ul v-if="nameConditions.length">
          <li v-for="condition in nameConditions" v-bind:class="condition.textType">
            {{ condition.message }}
          </li>
        </ul>
      </div>

      <div class="mb-3">
        <label for="username" class="form-label">Username</label>
        <input id="username" class="form-control" v-model="username" type="text" name="username">
        <ul v-if="usernameConditions.length">
          <li v-for="condition in usernameConditions" v-bind:class="condition.textType">
            {{ condition.message }}
          </li>
        </ul>
      </div>

      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input id="email" class="form-control" v-model="email" type="email" name="email">
        <ul v-if="emailConditions.length">
          <li v-for="condition in emailConditions" v-bind:class="condition.textType">
            {{ condition.message }}
          </li>
        </ul>
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input id="password" class="form-control" v-model="password" type="password" name="password">
        <ul v-if="passwordConditions.length">
          <li v-for="condition in passwordConditions" v-bind:class="condition.textType">
            {{ condition.message }}
          </li>
        </ul>
      </div>

      <button @click="registerNewUser" class="btn btn-outline-primary">Submit</button>
    </form>
  </div>
  `,

  data() {
    return {
      name: null,
      validName: false,
      nameConditions: [
        {message: "Cannot be empty", textType: null},
        {message: "Only alphabets and space allowed", textType: null},
      ],

      username: null,
      validUsername: false,
      usernameConditions: [
        {message: "Can only contain upper and lower case alphabets, numbers and _", textType: null},
        {message: "Cannot start with a number or _", textType: null},
        {message: "At least 5 characters", textType: null}
      ],

      email: null,
      validEmail: false,
      emailConditions: [
        {message: "Required Field", textType: null}
      ],
      
      password: null,
      validPassword: false,
      passwordConditions: [
        {message: "Contain at least one alphabet", textType: null},
        {message: "Contain at least one number", textType: null},
        {message: "At least than 8 characters", textType: null}
      ],
    }
  },
  
  methods: {
    registerNewUser: function(e) {
      e.preventDefault();
      let processServerResponse = (data) => {
        if (data.success == true) {
          this.$router.push('login')
        } else {
          alert('failed')
        }
      }
      if (this.validName && this.validUsername && this.validPassword) {
        let userData = {name: this.name, username: this.username, email: this.email, password: this.password}
        fetch('http://localhost:8080/registerUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData),
        }).then((res) => res.json()).then((data) => processServerResponse(data)).catch((error) => alert(error));
      }
    }
  },
  
  watch: {
    name: function() {
      this.validName = true
      var re = RegExp("^[a-zA-Z ]+$")
      if (this.name.trim().length == 0) {
        this.validName = false
        this.nameConditions[0].textType = 'error-condition'
      } else {
        this.nameConditions[0].textType = 'valid-condition'
      }

      if (re.test(this.name)) {
        this.nameConditions[1].textType = 'valid-condition'
      } else {
        this.validName = false
        this.nameConditions[1].textType = 'error-condition'
      }
    },
    username: function () {
      this.validUsername = true
      var re = RegExp("[^\\w]")
      if (this.username.length == 0 || re.test(this.username)) {
        this.validUsername = false
        this.usernameConditions[0].textType = 'error-condition'
      } else {
        this.usernameConditions[0].textType = 'valid-condition'
      }
      
      if (this.username.length > 0 && this.username[0] != '_') {
        this.usernameConditions[1].textType = 'valid-condition'
      } else {
        this.validUsername = false
        this.usernameConditions[1].textType = 'error-condition'
      }

      if (this.username.length >= 5) {
        this.usernameConditions[2].textType = 'valid-condition'
      } else {
        this.validUsername = false
        this.usernameConditions[2].textType = 'error-condition'
      }
    },
    email: function () {
      this.validEmail = true
      if (this.email.trim().length > 0) {
        this.emailConditions[0].textType = 'valid-condition'
      } else {
        this.validEmail = false
        this.emailConditions[0].textType = 'error-condition'
      }
    },
    password: function() {
      this.validPassword = true
      var re = RegExp("[a-zA-Z]")
      if (this.password.length > 0 && re.test(this.password)) {
        this.passwordConditions[0].textType = 'valid-condition'
      } else {
        this.validPassword = false
        this.passwordConditions[0].textType = 'error-condition'
      }

      var re = RegExp("[0-9]")
      if (this.password.length > 0 && re.test(this.password)) {
        this.passwordConditions[1].textType = 'valid-condition'
      } else {
        this.validPassword = false
        this.passwordConditions[1].textType = 'error-condition'
      }

      if (this.password.length >= 8) {
        this.passwordConditions[2].textType = 'valid-condition'
      } else {
        this.validPassword = false
        this.passwordConditions[2].textType = 'error-condition'
      }
    }
  }
}

export default register