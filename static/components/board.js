const board = {
  template: `
    <div class='container'>
      <div class='center'> Welcome {{ name }}</div>
      
      <!-- Create List -->
      <button @click="createListForm=!createListForm" class="btn btn-outline-primary btn"> + </button>
      <form v-if="createListForm" id="app" action="#" method="post">
        <div class='mb-3'>
          <label for="listTitle" class="form-label">Title</label>
          <input id="listTitle" class="form-control" v-model="listTitle" type="text">
          <ul v-if="listTitleErrors.length">
            <li v-for="error in listTitleErrors" class="error-condition">
              {{ error }}
            </li>
          </ul>
        </div>
        <button @click="createNewList" class="btn btn-outline-primary">Submit</button>
      </form>

      <!-- Lists View -->
      <div class="row row-cols-3">
        <div v-for="list in lists" class="col">
          <h3>
            {{ list.title }}
            <button @click="createCardForm=!createCardForm; selectedListId=list.public_id" class="btn btn-outline-success btn"> + </button>
            <button @click="listDeletePopup=!listDeletePopup; selectedListId=list.public_id" class="btn btn-outline-danger btn"> - </button>
          </h3>

          <!-- Delete List -->
          <form v-if="listDeletePopup && selectedListId == list.public_id" id="app" action="#" method="delete">
            Are you sure?
            <button @click="deleteList" class="btn btn-outline-primary btn-sm">Yes</button>
            <button @click="listDeletePopup=!listDeletePopup; selectedListId=null" class="btn btn-outline-secondary btn-sm">No</button>
          </form>

          <!-- Create Card -->
          <form v-if="createCardForm && selectedListId == list.public_id" id="app" action="#" method="post">
            <label for="cardTitle" class="form-label">Title</label>
            <input id="cardTitle" class="form-control" v-model="cardTitle" type="text">
            <ul v-if="cardTitleErrors.length">
              <li v-for="error in cardTitleErrors" class="error-condition">
                {{ error }}
              </li>
            </ul>
            <label for="cardContent" class="form-label">Content</label>
            <input id="cardContent" class="form-control" v-model="cardContent" type="text">
            <button @click="createNewCard($event, list.public_id)" class="btn btn-outline-primary">Submit</button>
          </form>

          <!-- Cards View -->
          <div v-for="card in list.cards">
            <div class="card-body">
              <form v-if="cardUnderEdit && cardUnderEdit.public_id == card.public_id" id="app" action="#" method="post">
                <button @click="cardUnderEdit=null" class="btn btn-outline-success btn-sm"> ? </button>
                <button @click="cardDeletePopup=!cardDeletePopup; cardUnderDeletion=card" class="btn btn-outline-danger btn-sm"> - </button>
                <input class="form-control" v-model="cardUnderEdit.title" type="text">
                <input class="form-control" v-model="cardUnderEdit.content" type="text">
                <button @click="editCard" class="btn btn-outline-primary">Submit</button>
              </form>

              <div v-else>
                <h5 class="card-title">
                  {{ card.title }}
                  <button @click="cardUnderEdit=card" class="btn btn-outline-success btn-sm"> ? </button>
                  <button @click="cardDeletePopup=!cardDeletePopup; cardUnderDeletion=card" class="btn btn-outline-danger btn-sm"> - </button>
                </h5>

                <!-- Card Delete -->
                <form v-if="cardDeletePopup && cardUnderDeletion.public_id == card.public_id" id="app" action="#" method="delete">
                  Are you sure?
                  <button @click="deleteCard" class="btn btn-outline-primary btn-sm">Yes</button>
                  <button @click="cardDeletePopup=!cardDeletePopup; cardUnderDeletion.public_id=null" class="btn btn-outline-secondary btn-sm">No</button>
                </form>

                <p class="card-text">{{ card.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,

  data () {
    return {
      name: null,
      lists: null,

      listTitle: null,
      validListTitle: false,
      listTitleErrors: [],
      createListForm: false,
      listDeletePopup: false,
      selectedListId: null,

      cardTitle: null,
      cardContent: null,
      validCardTitle: false,
      cardTitleErrors: [],
      createCardForm: false,
      cardDeletePopup: false,
      cardUnderDeletion: null,
      cardUnderEdit: null,
    }
  },

  mounted: function () {
    let processServerResponse = (data) => {
      if (data.name && data.lists) {
        this.name = data.name
        this.lists = data.lists
      } else {
        alert(data)
        this.$router.push('/login')
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
    listTitle: function () {
      this.validListTitle = true
      this.listTitleErrors = []

      if (this.listTitle.trim().length == 0) {
        this.validListTitle = false
        this.listTitleErrors.push('Title cannot be empty')
      } else if (this.listTitle.trim().length > 20) {
        this.validListTitle = false
        this.listTitleErrors.push('Title is too long')
      }
    },

    cardTitle: function () {
      this.validCardTitle = true
      this.cardTitleErrors = []

      if (this.cardTitle.trim().length == 0) {
        this.validCardTitle = false
        this.cardTitleErrors.push('Title cannot be empty')
      } else if (this.cardTitle.trim().length > 20) {
        this.validCardTitle = false
        this.cardTitleErrors.push('Title is too long')
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
          alert(data)
          this.$router.push('/login')
        }
      }
      if (this.validListTitle) {
        let newListData = {'listTitle': this.listTitle.trim()}
        let token = localStorage.getItem('token')
        fetch('http://localhost:8080/createList', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(newListData)
        }).then(res => res.json()).then(data => processServerResponse(data)).catch(error => alert(error))
      }
    },

    deleteList: function(e) {
      e.preventDefault();
      let processServerResponse = (data) => {
        if (data.success == true) {
          this.$router.go()
        } else {
          alert(data)
          this.$router.push('/login')
        }
      }
      if (this.selectedListId) {
        let deleteListData = {'public_id': this.selectedListId}
        let token = localStorage.getItem('token')
        fetch('http://localhost:8080/deleteList', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(deleteListData)
        }).then(res => res.json()).then(data => processServerResponse(data)).catch(error => alert(error))
      }
    },

    createNewCard: function(e, listPublicId) {
      e.preventDefault();
      let processServerResponse = (data) => {
        if (data.success == true) {
          this.$router.go()
        } else {
          alert(data)
          this.$router.push('/login')
        }
      }
      if (this.validCardTitle) {
        let newupdatedCardData = {
          'cardTitle': this.cardTitle.trim(),
          'cardContent': this.cardContent?this.cardContent.trim():"",
          'listPublicId': listPublicId
        }
        let token = localStorage.getItem('token')
        fetch('http://localhost:8080/createCard', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(newupdatedCardData)
        }).then(res => res.json()).then(data => processServerResponse(data)).catch(error => alert(error))
      }
    },

    deleteCard: function(e) {
      e.preventDefault();
      let processServerResponse = (data) => {
        if (data.success == true) {
          this.$router.go()
        } else {
          alert(data)
          this.$router.push('/login')
        }
      }
      if (this.cardUnderDeletion) {
        let deleteupdatedCardData = {'public_id': this.cardUnderDeletion.public_id}
        let token = localStorage.getItem('token')
        fetch('http://localhost:8080/deleteCard', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(deleteupdatedCardData)
        }).then(res => res.json()).then(data => processServerResponse(data)).catch(error => alert(error))
      }
    },

    editCard: function(e) {
      e.preventDefault();
      let processServerResponse = (data) => {
        if (data.success == true) {
          this.$router.go()
        } else {
          alert(data)
          this.$router.push('/login')
        }
      }
      if (this.cardUnderEdit) {
        let updatedCardData = {
          'public_id': this.cardUnderEdit.public_id,
          'newTitle': this.cardUnderEdit.title,
          'newContent': this.cardUnderEdit.content,
        }
        let token = localStorage.getItem('token')
        fetch('http://localhost:8080/updateCard', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedCardData)
        }).then(res => res.json()).then(data => processServerResponse(data)).catch(error => alert(error))
      }
    }
  }
}

export default board