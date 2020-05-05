import requests
import json
import collections
import yaml
import os
import typing
from typing import Tuple
import flask
from flask import request, jsonify, g, abort, session
import redis
from flask_session import Session
import urllib
from urllib.parse import urlencode
import time
import webbrowser
from uuid import uuid4
import pickle
from functools import wraps
from user import User


CONFIG_FILE = 'auth.yaml'
with open(CONFIG_FILE, 'r') as config_file:
    config = yaml.load(config_file, Loader=yaml.FullLoader)

redis_host = config['session']['redis_host']
redis_port = config['session']['redis_port']
redis_password = config['session']['password']
secret_key = config['session']['secret_key']

app = flask.Flask(__name__)

SECRET_KEY = secret_key
SESSION_TYPE = 'redis'
SESSION_REDIS = redis.Redis(
    host=redis_host,
    port=int(redis_port),
    password=redis_password
)

app.config.from_object(__name__)
sess = Session(app)
sess.init_app(app)


def serialize_user(user):
    pickled_user = pickle.dumps(user)
    session['user'] = pickled_user


def deserialize_user():
    pickled_user = session['user']
    user = pickle.loads(pickled_user)
    return user


def establish_session():
    new_user = User()
    session['id'] = session.sid
    serialize_user(new_user)
    new_user.open_auth_url()
    # auth_url = new_user.open_auth_url()
    # print(auth_url)
    return new_user


def get_session_client():
    if session.get('id'):
        user = deserialize_user()
    else:
        user = establish_session()
    return user


def get_playlist_id(playlist_input: str):
    if len(playlist_input) == 22:
        return playlist_input
    if not playlist_input.startswith('http'):
        playlist_id = playlist_input.split(':')[2]
        return playlist_id
    else:
        split_url = playlist_input.split('/')
        for idx, piece in enumerate(split_url):
            if piece == 'playlist':
                return split_url[idx+1][0:22]


@app.route('/callback', methods=['GET', 'POST'])
def get_code():
    user = get_session_client()
    auth_code = request.args.get('code')
    # state = request.args.get('state')
    user.set_code(auth_code)
    serialize_user(user)
    return('success')


@app.route('/')
def home():
    # if session.get('id'):
    #     session.pop('id')
    user = get_session_client()
    return 'hello world'


@app.route('/test')
def test():
    user = get_session_client()
    return user.test()


@app.route('/playlist_recommendation', methods=['POST'])
def get_recommendations_from_playlist():
    user = get_session_client()
    playlist = request.args.get('playlist')
    target_length = request.args.get('length')
    playlist_id = get_playlist_id(playlist)
    recommendations = user.get_playlist_recommendations(
        playlist_id,
        target_length
    )
    return recommendations


if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)
    # app.run(debug=True)
