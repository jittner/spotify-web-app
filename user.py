import requests
import json
import spotipy
import collections
import yaml
import typing
import pandas as pd
import numpy as np
from typing import Tuple
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import urllib
from urllib.parse import urlencode
import time
import webbrowser
from uuid import uuid4
from functools import wraps


API_KEY_FILE = 'auth.yaml'
API_LIMIT = 50


class User():
    AUTHORIZE_URL = 'https://accounts.spotify.com/authorize'
    TOKEN_URL = 'https://accounts.spotify.com/api/token'

    def __init__(self):
        self.__scope = 'user-library-read playlist-modify-private user-top-read'
        self.__redirect = 'http://localhost:5000/callback'
        self.__get_credentials()

    def set_code(self, code):
        self.__code = code
        self.__get_access_token()

    def open_auth_url(self):
        # state = str(uuid4())
        # self.state = state
        auth_url = self.__get_auth_url()
        # return auth_url
        webbrowser.open(auth_url)

    def update_spotipy_client(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            if not self.__is_token_valid():
                self.__refresh_access_token(self.__refresh_token)
                self.__sp = spotipy.Spotify(auth=self.__access_token)
            return func(self, *args, **kwargs)
        return wrapper

    @update_spotipy_client
    def test(self):
        user = self.__get_current_spotify_user()
        user_id = user['id']
        return user_id

    def __get_credentials(self):
        with open(API_KEY_FILE, 'r') as config_file:
            config = yaml.load(config_file, Loader=yaml.FullLoader)
        self.__client_id = config['spotify']['client_id']
        self.__client_secret = config['spotify']['client_secret']

    def __get_auth_url(self, state=None):
        payload = {
            'client_id': self.__client_id,
            'response_type': 'code',
            'redirect_uri': self.__redirect,
            'scope': self.__scope,
        }
        if state is not None:
            payload['state'] = state
        urlparams = urlencode(payload)
        return "%s?%s" % (self.AUTHORIZE_URL, urlparams)

    def __get_access_token(self):
        payload = {
            'redirect_uri': self.__redirect,
            'code': self.__code,
            'grant_type': 'authorization_code'
        }
        response = requests.post(
            self.TOKEN_URL,
            data=payload,
            auth=(
                self.__client_id,
                self.__client_secret
            )
        ).json()
        self.__access_token = response['access_token']
        self.__refresh_token = response['refresh_token']
        token_expires = response['expires_in']
        self.__token_expiry = time.time() + int(token_expires)
        self.__sp = spotipy.Spotify(auth=self.__access_token)

    def __refresh_access_token(self, refresh_token):
        response = requests.post(self.TOKEN_URL,
                                 {
                                     'grant_type': 'refresh_token',
                                     'refresh_token': str(refresh_token),
                                     'client_id': self.__client_id,
                                     'client_secret': self.__client_secret
                                 }
                                 ).json()
        self.__access_token = response['access_token']
        token_expires = response['expires_in']
        self.__token_expiry = time.time() + int(token_expires)

    def __is_token_valid(self):
        if time.time() > self.__token_expiry:
            return False
        else:
            return True

    @update_spotipy_client
    def search(self, query, limit=10, search_type='track'):
        return self.__sp.search(
            query,
            limit,
            search_type
        )

    @update_spotipy_client
    def copy_playlist(self, first_playlist_id, second_playlist_id):
        username = self.__get_current_spotify_user()['id']
        first_playlist = self.__sp.playlist_tracks(first_playlist_id)
        playlist_tracks = first_playlist['items']
        tracks_to_add = [track['track']['id'] for track in playlist_tracks]
        self.__sp.user_playlist_add_tracks(
            username,
            second_playlist_id,
            tracks_to_add
        )

    @update_spotipy_client
    def find_duplicate_songs(self, playlist_id: str) -> Tuple[dict, dict]:
        playlist = self.__sp.playlist_tracks(playlist_id)
        tracks = playlist['items']
        track_positions = collections.defaultdict(list)
        artists = collections.defaultdict(dict)
        duplicate_ids = set()
        possible_duplicates = collections.defaultdict(set)
        exact_duplicates = collections.defaultdict(list)

        for position, track in enumerate(tracks):
            track_name, track_id = track['track']['name'], track['track']['id']
            if track_id in track_positions:
                duplicate_ids.add(track_id)
                track_positions[track_id].append(position)
                continue
            else:
                track_positions[track_id].append(position)

            for artist in track['track']['artists']:
                artist_name = artist['name']
                if track_name in artists[artist_name]:
                    artists[artist_name][track_name].append(track_id)
                    possible_duplicates[track_name].update(
                        artists[artist_name][track_name]
                    )
                else:
                    artists[artist_name][track_name] = [track_id]

        if duplicate_ids:
            exact_duplicates = {
                track_id: track_positions[track_id] for track_id in duplicate_ids
            }

        if possible_duplicates:
            for key, value in possible_duplicates.items():
                dupe_name_ids = list(value)
                id_position_pairs = [
                    {name_id: track_positions[name_id]} for name_id in dupe_name_ids
                ]
                possible_duplicates[key] = id_position_pairs

        return (exact_duplicates, possible_duplicates)

    @update_spotipy_client
    def remove_track_from_playlist(self, playlist_id: str, tracks: list):
        # tracks format: [{"uri": X, "positions":[X]}, {etc}]
        user = self.__get_current_spotify_user()['id']
        playlist = self.__sp.playlist(playlist_id)
        snapshot_id = playlist['snapshot_id']
        self.__sp.user_playlist_remove_specific_occurences_of_tracks(
            user,
            playlist_id,
            tracks,
            snapshot_id
        )

    @update_spotipy_client
    def create_playlist(self, playlist_name, playlist, privacy):
        if privacy == 'public':
            public = True
        else:
            public = False
        new_playlist = self.__create_empty_playlist(playlist_name, public)
        playlist_id = new_playlist['id']
        track_ids = [track['id'] for track in playlist['tracks']]
        self.__add_to_playlist(playlist_id, track_ids)
        return new_playlist

    @update_spotipy_client
    def __create_empty_playlist(self, playlist_name, public=True, description=''):
        user = self.__get_current_spotify_user()['id']
        playlist = self.__sp.user_playlist_create(
            user,
            playlist_name,
            public,
            description
        )
        return playlist

    @update_spotipy_client
    def __add_to_playlist(self, playlist_id, tracks):
        user = self.__get_current_spotify_user()['id']
        snapshot = self.__sp.user_playlist_add_tracks(
            user,
            playlist_id,
            tracks
        )
        return snapshot

    @update_spotipy_client
    def get_top_artists(self, length: str, limit: int) -> list:
        top_artists = self.__sp.current_user_top_artists(limit, 0, length)
        top_artist_ids = [artist['id'] for artist in top_artists['items']]
        return top_artist_ids

    @update_spotipy_client
    def get_top_tracks(self, length: str, limit: str) -> list:
        top_tracks = self.__sp.current_user_top_tracks(limit, 0, length)
        top_track_ids = [track['id'] for track in top_tracks['items']]
        return top_track_ids

    def count_genres_from_artists(self, artists: dict) -> dict:
        genres_count = collections.defaultdict(int)
        for artist in artists['items']:
            genres = artist['genres']
            for genre in genres:
                genres_count[genre] += 1
        return genres_count

    @update_spotipy_client
    def get_artist_analysis(self, artist_ids: list):
        artists = self.__sp.artists(artist_ids)
        artist_ids = [artist['id'] for artist in artists['artists']]
        df_artists = self.__get_artists_df(artist_ids)
        return df_artists

    @update_spotipy_client
    def get_track_analysis(self, track_ids: list):
        tracks = self.__sp.tracks(track_ids)
        track_ids = [track['id'] for track in tracks['tracks']]
        df_tracks = self.__get_track_init_df(track_ids)
        df_features = self.__get_track_features_df(track_ids)
        combined_df = df_features.merge(df_tracks, on='id')
        return combined_df

    @update_spotipy_client
    def get_recommendations_with_direct_seed(
        self,
        seed_artists=None,
        seed_genres=None,
        seed_tracks=None,
        target_size=20
    ):
        recommendations = self.__sp.recommendations(
            seed_artists,
            seed_genres,
            seed_tracks,
            target_size
        )
        recommendations = self.__process_recommendations(recommendations)
        return recommendations

    @update_spotipy_client
    def get_recommendations_with_generated_seed(self, artists=None,
                                                tracks=None,
                                                seed_genres=None,
                                                target_size=20):
        if artists:
            top_artists = [
                self.get_top_artists(length, limit)
                for length, limit in artists.items()
            ]
            seed_artists = [
                artist for top_lists in top_artists for artist in top_lists
            ]
        if tracks:
            top_tracks = [
                self.get_top_tracks(length, limit)
                for length, limit in tracks.items()
            ]
            seed_tracks = [
                track for top_lists in top_tracks for track in top_lists
            ]
        recommendations = self.__sp.recommendations(
            seed_artists,
            seed_genres,
            seed_tracks,
            target_size
        )
        recommendations = self.__process_recommendations(recommendations)
        return recommendations

    @update_spotipy_client
    def get_playlist_recommendations(self, playlist_id, target_playlist_length=20):
        playlist_df = self.__get_playlist_attributes_df(playlist_id)
        seed_tracks = self.__cluster_playlist(playlist_df)
        recommendations = self.get_recommendations_with_direct_seed(
            seed_tracks=seed_tracks,
            target_size=target_playlist_length
        )
        recommendations = self.__process_recommendations(recommendations)
        return recommendations

    def __process_recommendations(self, recommendations):
        for track in recommendations['tracks']:
            track['embed_url'] = 'https://open.spotify.com/embed/track/' + track['id']
            artist_names = [artist['name'] for artist in track['artists']]
            track['artist_names'] = ', '.join(artist_names)
        return recommendations

    def __cluster_playlist(self, playlist_df):
        cluster_features = ['acousticness', 'danceability', 'instrumentalness',
                            'energy', 'speechiness']
        df_cluster = playlist_df[cluster_features]
        X = np.array(df_cluster)
        scaler = StandardScaler()
        scaler.fit(X)
        X = scaler.transform(X)
        kmm = KMeans(n_clusters=5, max_iter=10000).fit(X)
        seed_songs = []
        for cluster_idx in range(5):
            cluster = df_cluster[kmm.labels_ == cluster_idx]
            cluster_sample = cluster.sample()
            seed_songs.extend(cluster_sample.index.values.tolist())
        return seed_songs

    def __get_playlist_attributes_df(self, playlist_id: str):
        playlist_tracks = self.__sp.playlist_tracks(playlist_id)
        tracks = playlist_tracks['items']
        df_tracks = self.__get_track_init_df(tracks)

        artist_ids = df_tracks['artist_id'].unique().tolist()
        df_artists = self.__get_artists_df(artist_ids)

        track_ids = df_tracks['id'].unique().tolist()
        df_features = self.__get_track_features_df(track_ids)

        playlist_df = df_features.merge(df_tracks, on='id')
        playlist_df = playlist_df.merge(df_artists, on='artist_id')
        playlist_df['full_name'] = playlist_df['artist_name'] + \
            ' -- ' + playlist_df['song_name']

        playlist_df = playlist_df.set_index('id')
        return playlist_df

    def __get_track_init_df(self, tracks: list):
        df_tracks = pd.DataFrame(
            [[t['track']['id'], t['track']['name'], t['track']['artists'][0]['id'],
              t['track']['artists'][0]['name'], t['track']['album']['name'],
              t['track']['popularity']] for t in tracks]
        )
        df_tracks.columns = ['id', 'song_name', 'artist_id',
                             'artist_name', 'album_name', 'popularity']
        df_tracks['popularity_norm'] = df_tracks['popularity'] / 100
        df_tracks = df_tracks.drop_duplicates()
        return df_tracks

    def __get_artists_df(self, artist_ids: list):
        artist_list = []
        while artist_ids:
            artist_results = self.__sp.artists(artist_ids[:API_LIMIT])
            artist_list += [
                [
                    artist['id'],
                    artist['genres'],
                    artist['popularity']
                ]
                for artist in artist_results['artists']
            ]
            artist_ids = artist_ids[API_LIMIT:]

        df_artists = pd.DataFrame(
            artist_list,
            columns=[
                'artist_id', 'artist_genres', 'artist_popularity'
            ]
        )
        df_artists['artist_popularity_norm'] = \
            (df_artists['artist_popularity'] / 100)
        return df_artists

    def __get_track_features_df(self, track_ids: list):
        feature_list = []
        while track_ids:
            feature_results = self.__sp.audio_features(track_ids[:API_LIMIT])
            feature_list += feature_results
            track_ids = track_ids[API_LIMIT:]

        df_features = pd.DataFrame(feature_list)[['id', 'analysis_url',
                                                  'duration_ms', 'acousticness',
                                                  'danceability',
                                                  'energy', 'instrumentalness',
                                                  'liveness', 'loudness',
                                                  'valence', 'speechiness',
                                                  'key', 'mode',
                                                  'tempo', 'time_signature']]
        df_features['tempo_norm'] = (df_features['tempo'] - 24) / 176
        return df_features

    def __get_current_spotify_user(self):
        user_spotify = self.__sp.current_user()
        username = user_spotify['id']
        return user_spotify
