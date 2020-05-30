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
from flask_cors import CORS


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
CORS(app, supports_credentials=True)


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
        print("no cookie!")
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


def parse_recommendation(user, request_data):
    target_length = request_data['length']
    request_type = request_data['request_type']
    if request_type == 'from_playlist':
        playlist = request_data['playlist']
        playlist_id = get_playlist_id(playlist)
        recommendations = user.get_playlist_recommendations(
            playlist_id,
            target_length
        )
    elif request_type == 'from_generated':
        artists = request_data['artists']
        tracks = request_data['tracks']
        artists_length = request_data['artists_length']
        tracks_length = request_data['tracks_length']
        top_artists = {artists_length: artists}
        top_tracks = {tracks_length: tracks}
        seed_genres = None
        recommendations = user.get_recommendations_with_generated_seed(
            top_artists,
            top_tracks,
            seed_genres,
            target_length
        )
    return recommendations


@app.route('/callback', methods=['GET', 'POST'])
def get_code():
    user = get_session_client()
    auth_code = request.args.get('code')
    # state = request.args.get('state')
    user.set_code(auth_code)
    serialize_user(user)
    return('auth code retrieved')


@app.route('/')
def home():
    # if session.get('id'):
    #     session.pop('id')
    user = get_session_client()
    return('hello world')


@app.route('/test')
def test():
    user = get_session_client()
    return user.test()


@app.route('/playlist_recommendation', methods=['GET', 'POST'])
def get_recommendations_from_playlist():
    user = get_session_client()
    request_data = request.get_json()
    playlist = request_data['playlist']
    target_length = request_data['length']
    playlist_id = get_playlist_id(playlist)
    recommendations = user.get_playlist_recommendations(
        playlist_id,
        target_length
    )
    return recommendations


@app.route('/recommendation', methods=['GET', 'POST'])
def get_recommendations():
    user = get_session_client()
    request_data = request.get_json()
    recommendations = parse_recommendation(user, request_data)
    return recommendations


@app.route('/copy_playlist', methods=['POST'])
def copy_playlist():
    user = get_session_client()
    request_data = request.get_json()
    source_playlist = request_data['source']
    dest_playlist = request_data['destination']
    source_id = get_playlist_id(source_playlist)
    dest_id = get_playlist_id(dest_playlist)
    user.copy_playlist(source_id, dest_id)
    return dest_id


@app.route('/find_duplicates', methods=['GET', 'POST'])
def find_duplicates():
    user = get_session_client()
    request_data = request.get_json()
    playlist = request_data['playlist']
    playlist_id = get_playlist_id(playlist)
    duplicates = user.find_duplicate_songs(playlist_id)
    return jsonify(duplicates)


@app.route('/create_playlist', methods=['GET', 'POST'])
def create_playlist_from_tracks():
    user = get_session_client()
    request_data = request.get_json()
    playlist_name = request_data['name']
    playlist_tracks = request_data['playlist']
    privacy = request_data['privacy']
    playlist = user.create_playlist_from_tracks(
        playlist_name, playlist_tracks, privacy)
    return playlist


@app.route('/create_empty_playlist', methods=['GET', 'POST'])
def create_empty_playlist():
    user = get_session_client()
    request_data = request.get_json()
    playlist_name = request_data['name']
    privacy = request_data['privacy']
    playlist = user.create_empty_playlist(playlist_name, privacy)
    return playlist['external_urls']


if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)
