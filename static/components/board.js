const board = {
  template: `
    <div class='container'>
      <div class='center'> Welcome {{ name }}</div>
      
      <button @click="viewForm=true" class="btn btn-primary" name="create_button"> + </button>

      <form v-if="viewForm" id="app" action="#" method="post">
        <div class='mb-3'>
          <label for="title" class="form-label">Title</label>
          <input id="title" class="form-control" v-model="title" type="text" name="title">
          <ul v-if="titleErrors.length">
            <li v-for="error in titleErrors" class="error-condition">
              {{ error }}
            </li>
          </ul>
        </div>

        <button @click="createNewList" class="btn btn-outline-primary">Submit</button>
      </form>

      <div class="row row-cols-3">
        <div v-for="list in lists" class="col">
          {{ list.title }}
        </div>
      </div>
    </div>
  `,

  data () {
    return {
      name: null,
      lists: null,
      title: null,
      validTitle: false,
      titleErrors: [],
      viewForm: false,
    }
  },

  mounted: function () {
    let processServerResponse = (data) => {
      if (data.name && data.lists) {
        this.name = data.name
        this.lists = data.lists
      } else {
        alert(data)
      }
    }

    let token = localStorage.getItem('token')
    fetch('http://localhost:8080/getLists', {
      methods: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    }).then(res => res.json()).then(data => processServerResponse(data)).catch(error => alert(error))
  },

  watch: {
    title: function () {
      this.validTitle = true
      this.titleErrors = []

      if (this.title.trim().length == 0) {
        this.validTitle = false
        this.titleErrors.push('Title cannot be empty')
      } else if (this.title.trim().length > 20) {
        this.validTitle = false
        this.titleErrors.push('Title is too long')
      }
    }
  },

  methods: {
    createNewList: function (e) {
      e.preventDefault();
      
      let processServerResponse = (data) => {
        if (data.success == true) {
          this.$router.go()
        } else {
          alert('failed')
        }
      }

      if (this.validTitle) {
        let newListData = {'title': this.title.trim()}
        let token = localStorage.getItem('token')
        fetch('http://localhost:8080/createList', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(newListData)
        }).then(res => res.json()).then(data => processServerResponse(data)).catch(error => alert(error))
      }
    }
  }
}

export default board