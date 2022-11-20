import os
from werkzeug.security import generate_password_hash

from flask import Flask, render_template, redirect, request
from flask_sqlalchemy import SQLAlchemy


curr_dir = os.path.abspath(os.path.dirname(__name__))

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(curr_dir, 'database.sqlite3')
db = SQLAlchemy()
db.init_app(app)
app.app_context().push()



# ORM
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String, unique=True, nullable=False)
    name = db.Column(db.String, unique=False, nullable=False)
    password = db.Column(db.String(255), unique=False, nullable=False)
    fn_uniquifier = db.Column(db.String(255), unique=True, nullable=False)



@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/registerUser', methods=['POST'])
def register():
    # form_data = request.form.to_dict()
    # form_data['password'] = generate_password_hash(form_data['password'], 'sha256')
    print(request.data)
    return {'success': True, 'redirect': '/'}


# @app.route('/login', methods=['GET', 'POST'])
# def login():
#     if request.method == 'POST':
#         return render_template('home.html')

#     return render_template('login.html')



if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=8080,
        debug=True
    )