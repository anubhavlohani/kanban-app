const summary = {
  template: `
      <div class="container">      
        <div class='center'> Welcome {{ name }}</div>

        <table class="table table-striped">
          <thead class="table-dark">
            <tr>
              <th scope="col">#</th>
              <th scope="col">List Name</th>
              <th scope="col">Total Tasks</th>
              <th scope="col">Completed Tasks</th>
              <th scope="col">Remaining Tasks</th>
              <th scope="col">Completed Before Deadline</th>
              <th scope="col">Completed After Deadline</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(list, index) in lists">
              <td>{{ index+1 }}</td>
              <td>{{ list.title }}</td>
              <td>{{ list.totalCards }}</td>
              <td>{{ list.completedCards }}</td>
              <td>{{ list.remainingCards }}</td>
              <td>{{ list.beforeDeadline }}</td>
              <td>{{ list.afterDeadline }}</td>
            </tr>
          </tbody>
        </table>

        <canvas ref="statusChart"></canvas>
        <canvas ref="completionChart"></canvas>
      </div>
  `,

  data () {
    return {
      name: null,
      lists: null,
    }
  },

  mounted: function () {
    // Get summary data
    let processServerResponse = (data) => {
      if (data.name && data.lists) {
        this.name = data.name
        this.lists = data.lists
        plotGraphs();

      } else {
        alert(data)
        this.$router.push('/login')
      }
    }
    let token = localStorage.getItem('token')
    fetch('http://localhost:8080/getSummary', {
      methods: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    }).then(res => res.json()).then(data => processServerResponse(data)).catch(error => alert(error))

    // Plot graphs
    let plotGraphs = () => {
      var listTitles = []
      var completedCards = []
      var remainingCards = []
      var beforeDeadline = []
      var afterDeadline = []
      this.lists.forEach(list => {
        listTitles.push(list.title)
        completedCards.push(list.completedCards)
        remainingCards.push(list.remainingCards)
        beforeDeadline.push(list.beforeDeadline)
        afterDeadline.push(list.afterDeadline)
      });

      var statusChart = this.$refs.statusChart;
      var ctx = statusChart.getContext("2d");
      var chart1 = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: listTitles,
          datasets: [
            {
              label: 'completed',
              data: completedCards,
              backgroundColor: 'lightblue',
              borderColor: "blue",
              borderWidth: 1
            },
            {
              label: 'pending',
              data: remainingCards,
              backgroundColor: 'lightyellow',
              borderColor: "orange",
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Completed vs Pending Tasks'
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });

      var completionChart = this.$refs.completionChart;
      var ctx = completionChart.getContext("2d");
      var chart2 = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: listTitles,
          datasets: [
            {
              label: 'On Time',
              data: beforeDeadline,
              backgroundColor: 'lightgreen',
              borderColor: "green",
              borderWidth: 1
            },
            {
              label: 'After Deadline',
              data: afterDeadline,
              backgroundColor: 'pink',
              borderColor: "red",
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Before vs After Deadline'
          },
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
          }
        }
      });
    }
  },
}



export default summary