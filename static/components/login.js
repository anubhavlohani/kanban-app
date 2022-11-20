const login = {
  template: `
    <form class="container" method="post">
    <h3 class="mb-3 center">Login</h3>
    
    <div class="mb-3">
      <label for="id_userEmail" class="form-label">Username</label>
      <input type="text" name="username" class="form-control" id="id_username">
    </div>

    <div class="mb-3">
      <label for="id_password" class="form-label">Password</label>
      <input type="password" name="password" class="form-control" id="id_password">
    </div>

    <div class="mb-3">
      <input type="checkbox" class="form-check-input" id="id_check1" required>
      <label for="check1" class="form-check-label">Confirm</label>
    </div>
    
    <button type="submit" class="btn btn-outline-primary">Submit</button>
  </form>
  `
}

export default login