import os
import datetime
import json
import jwt
import uuid
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash

from flask import Flask, render_template, request, make_response, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_caching import Cache

from tasks import export_list_csv


curr_dir = os.path.abspath(os.path.dirname(__name__))
config = {
    "SECRET_KEY": "mySuperDuperSecretKey",
    "SQLALCHEMY_DATABASE_URI": "sqlite:///" + os.path.join(curr_dir, 'database.sqlite3'),
    "CACHE_TYPE": "RedisCache",
    "CACHE_KEY_PREFIX": "kb_cache:/",
    "CACHE_REDIS_HOST": "localhost",
    "CACHE_REDIS_PORT": 6379,
}

app = Flask(__name__)
app.config.from_mapping(config)
cache = Cache(app)
db = SQLAlchemy()
db.init_app(app)
app.app_context().push()
with app.app_context():
    cache.clear()



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

    def _list_cards(self):
        cards = Card.query.filter_by(list=self.public_id).all()
        cards = [card.serialized for card in cards]
        return cards

    @property
    def serialized(self):
        return {
            'public_id': self.public_id,
            'title': self.title,
            'owner': self.owner,
            'cards': self._list_cards(),
        }

class Card(db.Model):
    __tablename__ = 'card'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    public_id = db.Column(db.String(50), unique=True, nullable=False)
    title = db.Column(db.String(20), unique=False, nullable=False)
    content = db.Column(db.String, unique=False, nullable=True)
    deadline = db.Column(db.String, unique=False, nullable=False)
    completed = db.Column(db.String, unique=False, nullable=False)
    list = db.Column(db.String, db.ForeignKey("list.public_id"), unique=False, nullable=False)

    @property
    def serialized(self):
        return {
            'public_id': self.public_id,
            'title': self.title,
            'content': self.content,
            'deadline': self.deadline,
            'completed': self.completed,
            'list': self.list,
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
@cache.cached(timeout=3600, key_prefix='home')
def home():
    return render_template('index.html')


@app.route('/registerUser', methods=['POST'])
@cache.cached(timeout=3600, key_prefix='register')
def register():
    data = json.loads(request.data)
    hashed_password = generate_password_hash(data['password'], 'sha256')
    public_id = str(uuid.uuid4())
    new_user = User(public_id=public_id, name=data['name'], username=data['username'], password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    return {'success': True}


@app.route('/login', methods=['POST'])
@cache.cached(timeout=3600, key_prefix='login')
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
    new_list = List(public_id=public_id, title=data['listTitle'], owner=current_user.username)
    db.session.add(new_list)
    db.session.commit()
    return {'success': True}

@app.route('/updateList', methods=['POST'])
@token_required
def update_list(curent_user):
    data = json.loads(request.data)
    list = List.query.filter_by(public_id=data['public_id']).first()
    list.title = data['newTitle']
    db.session.commit()
    return {'success': True}

@app.route('/deleteList', methods=['DELETE'])
@token_required
def delete_list(current_user):
    data = json.loads(request.data)
    list_to_delete = List.query.filter_by(public_id=data['public_id']).first()
    list_cards = Card.query.filter_by(list=data['public_id']).all()
    db.session.delete(list_to_delete)
    try:        
        for card in list_cards:
            db.session.delete(card)
    except Exception as err:
        print(err)
    db.session.commit()
    return {'success': True}


@app.route('/createCard', methods=['POST'])
@token_required
def create_card(current_user):
    data = json.loads(request.data)
    card_public_id = str(uuid.uuid4())
    card_deadline = data['cardDeadline']
    card_deadline = datetime.datetime.strptime(card_deadline, '%Y-%m-%dT%H:%M')
    card_deadline = card_deadline.strftime('%d/%m/%Y, %H:%M')
    new_card = Card(
        public_id=card_public_id,
        title=data['cardTitle'],
        content=data['cardContent'],
        deadline=card_deadline,
        completed='',
        list=data['listPublicId']
    )
    db.session.add(new_card)
    db.session.commit()
    return {'success': True}

@app.route('/updateCard', methods=['POST'])
@token_required
def update_card(current_user):
    data = json.loads(request.data)
    card_to_update = Card.query.filter_by(public_id=data['public_id']).first()
    card_to_update.title = data['newTitle']
    card_to_update.content = data['newContent']
    card_to_update.completed = data['newCompleted']
    card_to_update.list = data['newList']
    db.session.commit()
    return {'success': True}

@app.route('/deleteCard', methods=['DELETE'])
@token_required
def delete_card(current_user):
    data = json.loads(request.data)
    card_to_delete = Card.query.filter_by(public_id=data['public_id']).first()
    db.session.delete(card_to_delete)
    db.session.commit()
    return {'success': True}


@app.route('/getSummary', methods=['GET'])
@token_required
def get_summary(current_user):
    user_lists = List.query.filter_by(owner=current_user.username).all()
    user_lists = [list.serialized for list in user_lists]

    for i, list in enumerate(user_lists):
        completed_cards = 0
        completed_before_deadline = 0
        for card in list['cards']:
            if card['completed']:
                completed_cards += 1
                deadline = datetime.datetime.strptime(card['deadline'], "%d/%m/%Y, %H:%M")
                completion = datetime.datetime.strptime(card['completed'], "%d/%m/%Y, %H:%M")
                if completion <= deadline:
                    completed_before_deadline += 1
        user_lists[i]['totalCards'] = len(list['cards'])
        user_lists[i]['completedCards'] = completed_cards
        user_lists[i]['beforeDeadline'] = completed_before_deadline
        user_lists[i]['afterDeadline'] = completed_cards - completed_before_deadline
        user_lists[i]['remainingCards'] = len(list['cards']) - completed_cards
    return {'name': current_user.name, "lists": user_lists}


@app.route('/exportLists', methods=['GET'])
@token_required
def export_lists(current_user):
    available_lists = List.query.filter_by(owner=current_user.username).all()
    user_lists = [list.serialized for list in available_lists]
    export_list_csv.apply_async((current_user.username, user_lists))
    return "OK", 200





if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=8080,
        debug=True
    )