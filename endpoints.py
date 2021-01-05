import collections
import json
import os
import pickle
import typing
import webbrowser
from functools import wraps
from typing import Tuple

import flask
import redis
import requests
import yaml
from flask import abort, g, jsonify, redirect, request, session, url_for
from flask_cors import CORS
from flask_dance.contrib.spotify import make_spotify_blueprint, spotify
from flask_session import Session
from oauthlib.oauth2.rfc6749.errors import (InvalidGrantError, OAuth2Error,
                                            TokenExpiredError)

import client_services as cs
from user import User

# TODO: implement error handling for invalid input (bad playlist URIs, etc)


CONFIG_FILE = 'auth.yaml'
with open(CONFIG_FILE, 'r') as config_file:
    config = yaml.load(config_file, Loader=yaml.FullLoader)

secret_key = config['session']['secret_key']
client_id = config['spotify']['client_id']
client_secret = config['spotify']['client_secret']
scope = 'user-library-read,playlist-modify-private,user-top-read,playlist-read-private,playlist-read-collaborative'

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
os.environ['OAUTHLIB_RELAX_TOKEN_SCOPE'] = '1'
app = flask.Flask(__name__)
app.secret_key = secret_key
blueprint = make_spotify_blueprint(
    client_id=client_id, client_secret=client_secret, scope=scope)
app.register_blueprint(blueprint, url_prefix='/login')

# app.config.from_object(__name__)
CORS(app, supports_credentials=True)


def get_playlist_id(playlist_input: str) -> str:
    # Spotipy already supports different ID types
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


def access_token_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if not spotify.authorized:
            return redirect(url_for('spotify.login'))
        elif spotify.token.get('expires_in') < 0:
            spotify.refresh_token(
                'https://accounts.spotify.com/api/token',
                client_id=client_id,
                client_secret=client_secret
            )
        return func(*args, **kwargs)
    return wrapper


@app.route('/')
@access_token_required
def index():
    if not spotify.authorized:
        return redirect(url_for('spotify.login'))
    try:
        resp = spotify.get("/v1/me")
        assert resp.ok, resp.text
    except (InvalidGrantError, TokenExpiredError) as e:
        return redirect(url_for("spotify.login"))
    return redirect('/user')


@app.route('/logout')
@access_token_required
def logout():
    pass


@app.route('/user', methods=['GET'])
@access_token_required
def user_profile():
    return cs.get_user_homepage_info(spotify.access_token)


@app.route('/user/top-artists/<term>', methods=['GET'])
@access_token_required
def get_top_artists(term: str):
    return {
        'data': cs.get_top_artists(spotify.access_token, term)
    }


@app.route('/user/top-tracks/<term>', methods=['GET'])
@access_token_required
def get_top_tracks(term: str):
    return {
        'data': cs.get_top_tracks(spotify.access_token, term)
    }


@app.route('/user/playlists', methods=['GET', 'POST'])
@access_token_required
def playlists():
    if request.method == 'GET':
        return {
            'data': cs.get_user_playlists(spotify.access_token)
        }
    elif request.method == 'POST':
        request_data = request.get_json()
        playlist_name = request_data['name']
        privacy = request_data['privacy']
        if request_data['playlist']:
            playlist_tracks = request_data['playlist']
            playlist = cs.create_playlist_from_tracks(
                spotify.access_token,
                playlist_name,
                playlist_tracks,
                privacy
            )
            return playlist['external_urls']
        else:
            playlist = cs.create_empty_playlist(
                spotify.access_token, playlist_name, privacy)
            return playlist['external_urls']


@app.route('/playlists/<playlist_id>', methods=['GET'])
@access_token_required
def get_playlist_info(playlist_id: str):
    return cs.get_playlist_analysis(spotify.access_token, playlist_id)


@app.route('/playlists/copies', methods=['POST'])
@access_token_required
def copy_playlist():
    request_data = request.get_json()
    source_playlist = request_data['source']
    dest_playlist = request_data['destination']
    cs.copy_playlist(spotify.access_token, source_playlist, dest_playlist)
    return dest_playlist


@app.route('/playlists/duplicates', methods=['GET', 'POST'])
@access_token_required
def find_duplicates():
    request_data = request.get_json()
    playlist = request_data['playlist']
    duplicates = cs.find_duplicate_songs(spotify.access_token, playlist)
    return jsonify(duplicates)


@app.route('/playlists/<playlist_id>/recommendations', methods=['GET'])
@access_token_required
def get_recommendations_from_playlist(playlist_id: str):
    # request_data = request.get_json()
    # playlist = request_data['playlist']
    # target_length = request_data['length']
    recommendations = cs.get_playlist_recommendations(
        spotify.access_token,
        playlist_id,
    )
    return recommendations


@app.route('/user/recommendations', methods=['GET', 'POST'])
@access_token_required
def get_recommendations_from_user():
    request_data = request.get_json()
    top_artists = {
        request_data['artists_length']: request_data['artists']
    }
    top_tracks = {
        request_data['tracks_length']: request_data['tracks']
    }
    seed_genres = None
    recommendations = cs.get_recommendations_with_generated_seed(
        spotify.access_token,
        top_artists,
        top_tracks,
        seed_genres,
        request_data['length']
    )
    return recommendations


if __name__ == '__main__':
    app.run(debug=True, host='localhost', port=5000)
