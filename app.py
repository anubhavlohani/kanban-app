import os
import datetime
import json
import jwt
import uuid
from functools import wraps
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

class List(db.Model):
    __tablename__ = 'list'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    public_id = db.Column(db.String(50), unique=True, nullable=False)
    title = db.Column(db.String(20), unique=False, nullable=False)
    owner = db.Column(db.String, db.ForeignKey("user.username"), unique=False, nullable=False)

    @property
    def serialized(self):
        return {
            'public_id': self.public_id,
            'title': self.title,
            'owner': self.owner
        }



def token_required(func):
    @wraps(func)
    def verify_token(*args, **kwargs):
        token = request.headers['Authorization'].split()[1]
        if not token:
            return make_response(jsonify('Invalid credentials'), 401)

        try:
            token_data = jwt.decode(token, app.config['SECRET_KEY'], 'HS256')
            public_id = token_data['public_id']
            current_user = User.query.filter_by(public_id=public_id).first()
            return func(current_user, *args, **kwargs)

        except jwt.ExpiredSignatureError:
            return make_response(jsonify('Session expired, please login again.'), 401)

    return verify_token



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
        token_expiration = datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        token = jwt.encode({'public_id': user.public_id, 'exp': token_expiration}, app.config['SECRET_KEY'])
        return {'token': token}
    
    return make_response(jsonify('Could not verify. Wrong password'), 401)


@app.route('/getLists', methods=['GET'])
@token_required
def get_lists(current_user):
    available_lists = List.query.filter_by(owner=current_user.username).all()
    user_lists = [list.serialized for list in available_lists]
    
    return {'name': current_user.name, "lists": user_lists}


@app.route('/createList', methods=['POST'])
@token_required
def create_list(current_user):
    data = json.loads(request.data)
    public_id = str(uuid.uuid4())
    new_list = List(public_id=public_id, title=data['title'], owner=current_user.username)
    db.session.add(new_list)
    db.session.commit()
    return {'success': True}

@app.route('/deleteList', methods=['DELETE'])
@token_required
def delete_list(current_user):
    data = json.loads(request.data)
    list_to_delete = List.query.filter_by(public_id=data['public_id']).first()
    db.session.delete(list_to_delete)
    db.session.commit()
    return {'success': True}


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=8080,
        debug=True
    )