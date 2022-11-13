const app = new Vue({
  el: "#app",
  delimiters: ['${', '}'],
  data: {
    username: null,
    validUsername: false,
    password: null,
    validPassword: false,
    usernameConditions: [
      {message: "Can only contain upper and lower case alphabets, numbers and _", textType: 'default'},
      {message: "Cannot start with a number or _", textType: 'default'},
      {message: "At least 5 characters", textType: 'default'}
    ],
    passwordConditions: [
      {message: "Contain at least one alphabet", textType: 'default'},
      {message: "Contain at least one number", textType: 'default'},
      {message: "At least than 8 characters", textType: 'default'}
    ],
  },
  methods: {
    checkForm: function (e) {
      if (this.validUsername && this.validPassword) {
        return true;
      }
      e.preventDefault();
    }
  },
  watch: {
    username: function () {
      this.validUsername = true
      var re = RegExp("[^\\w]")
      if (this.username.length == 0 || re.test(this.username)) {
        this.validUsername = false
        this.usernameConditions[0].textType = 'error'
      } else {
        this.usernameConditions[0].textType = 'valid'
      }
      
      if (this.username.length > 0 && this.username[0] != '_') {
        this.usernameConditions[1].textType = 'valid'
      } else {
        this.validUsername = false
        this.usernameConditions[1].textType = 'error'
      }

      if (this.username.length >= 5) {
        this.usernameConditions[2].textType = 'valid'
      } else {
        this.validUsername = false
        this.usernameConditions[2].textType = 'error'
      }
    },
    password: function() {
      this.validPassword = true
      var re = RegExp("[a-zA-Z]")
      if (this.password.length > 0 && re.test(this.password)) {
        this.passwordConditions[0].textType = 'valid'
      } else {
        this.validPassword = false
        this.passwordConditions[0].textType = 'error'
      }

      var re = RegExp("[0-9]")
      if (this.password.length > 0 && re.test(this.password)) {
        this.passwordConditions[1].textType = 'valid'
      } else {
        this.validPassword = false
        this.passwordConditions[1].textType = 'error'
      }

      if (this.password.length >= 8) {
        this.passwordConditions[2].textType = 'valid'
      } else {
        this.validPassword = false
        this.passwordConditions[2].textType = 'error'
      }
    }
  }
})