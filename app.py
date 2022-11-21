import os
import datetime
import json
import jwt
import uuid
from werkzeug.security import generate_password_hash, check_password_hash

from flask import Flask, render_template, request, make_response, jsonify
from flask_sqlalchemy import SQLAlchemy


curr_dir = os.path.abspath(os.path.dirname(__name__))

app = Flask(__name__)
app.config['SECRET_KEY'] = 'mySuperDuperSecretKey'
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(curr_dir, 'database.sqlite3')
db = SQLAlchemy()
db.init_app(app)
app.app_context().push()



# ORM
class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    public_id = db.Column(db.String(50), unique=True, nullable=False)
    name = db.Column(db.String, unique=False, nullable=False)
    username = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String(255), unique=False, nullable=False)



@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/registerUser', methods=['POST'])
def register():
    data = json.loads(request.data)

    hashed_password = generate_password_hash(data['password'], 'sha256')
    public_id = str(uuid.uuid4())

    new_user = User(public_id=public_id, name=data['name'], username=data['username'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()

    return {'success': True}


@app.route('/login', methods=['POST'])
def login():
    auth = request.authorization

    if not auth or not auth.username or not auth.password:
        return make_response(jsonify('Could not verify. Missing username and/or password'), 401)

    user = User.query.filter_by(username=auth.username).first()
    if not user:
        return make_response(jsonify('Could not verify. This username does not exist'), 401)

    if check_password_hash(user.password, auth.password):
        token_expiration = datetime.datetime.now() + datetime.timedelta(hours=1)
        token = jwt.encode({'public_id': user.public_id, 'exp': token_expiration}, app.config['SECRET_KEY'])
        return {'token': token}
    
    return make_response(jsonify('Could not verify. Wrong password'), 401)



if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=8080,
        debug=True
    )