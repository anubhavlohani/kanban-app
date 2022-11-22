const board = {
  template: `
    <div class='container'>
      <div>{{ name }}</div>
    </div>
  `,
  
  data () {
    return {
      name: null,
    }
  },

  mounted: function () {
    let processServerResponse = (data) => {
      if (data.name) {
        this.name = data.name
      } else {
        alert(data)
      }
    }

    let token = localStorage.getItem('token')
    console.log(token);
    fetch('http://localhost:8080/getLists', {
      methods: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    }).then(res => res.json()).then(data => processServerResponse(data)).catch(error => alert(error))
  }
}

export default board