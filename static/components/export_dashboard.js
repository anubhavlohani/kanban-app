const export_dashboard = {
  template: `
    <div class='container'>
      <h1 class="display-6 center"> Welcome {{ username }}</h1>

      <h4>
        Export Lists
        <button @click="exportLists" class="btn btn-primary"> Save </button>
      </h4>
    </div>
  `,

  data () {
    return {
      username: null,
    }
  },

  mounted: function () {
    let processServerResponse = (data) => {
      if (data.username) {
        this.username = data.username
      } else {
        alert(data)
        this.$router.push('/login')
      }
    }

    let token = localStorage.getItem('token')
    fetch('http://localhost:8080/getUsername', {
      methods: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    }).then(res => res.json()).then(data => processServerResponse(data)).catch(error => alert(error))
  },

  methods: {
    exportLists: function (e) {
      e.preventDefault();

      let processServerResponse = (data) => {
        if (data.success == true) {
          this.$router.go()
        } else {
          alert(data)
          this.$router.push('/login')
        }
      }
      let token = localStorage.getItem('token')
      fetch('http://localhost:8080/exportLists', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      }).then(res => res.json()).then(data => processServerResponse(data)).catch(error => alert(error))
    }
  }
}

export default export_dashboard