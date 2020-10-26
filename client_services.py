import spotipy
import collections
import typing
import pandas as pd
import numpy as np
from typing import Tuple, Set, Dict, List
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans

API_LIMIT = 50


def copy_playlist(client, first_playlist_id: str, second_playlist_id: str):
    username = get_current_spotify_user(client)
    first_playlist = client.playlist_tracks(first_playlist_id)
    playlist_tracks = first_playlist['items']
    tracks_to_add = [track['track']['id'] for track in playlist_tracks]
    client.user_playlist_add_tracks(
        username,
        second_playlist_id,
        tracks_to_add
    )


def get_current_spotify_user(client):
    user_spotify = client.current_user()
    username = user_spotify['id']
    return username


def find_duplicate_songs(client, playlist_id: str) -> Tuple[dict, dict]:
    playlist = client.playlist_tracks(playlist_id)
    tracks = playlist['items']
    track_positions = collections.defaultdict(list)
    artists = collections.defaultdict(dict)
    duplicate_ids = set()
    possible_duplicates = collections.defaultdict(set)
    # exact_duplicates = collections.defaultdict(list)
    track_return_info = collections.defaultdict(dict)

    for position, track in enumerate(tracks):
        track_name, track_id = track['track']['name'], track['track']['id']
        track_return_info[track_id]['name'] = track_name
        track_return_info[track_id]['artists'] = format_track_artists(
            track['track'])
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
        exact_duplicates = [
            {
                'id': track_id,
                'positions': track_positions[track_id],
                'name': track_return_info[track_id]['name'],
                'artists': track_return_info[track_id]['artists']
            } for track_id in duplicate_ids
        ]

    if possible_duplicates:
        for track_name, track_ids in possible_duplicates.items():
            dupe_name_ids = list(track_ids)
            id_position_pairs = [
                {
                    'id': name_id,
                    'positions': track_positions[name_id],
                    'name': track_return_info[name_id]['name'],
                    'artists': track_return_info[name_id]['artists']
                } for name_id in dupe_name_ids
            ]
            possible_duplicates[track_name] = id_position_pairs

    return {'exact': exact_duplicates,
            'possible': possible_duplicates}


def format_track_artists(track: dict) -> str:
    artist_names = [artist['name'] for artist in track['artists']]
    track_artists = ', '.join(artist_names)
    return track_artists


def remove_track_from_playlist(client, playlist_id: str, tracks: list):
    # tracks format: [{"uri": X, "positions":[X]}, {etc}]
    user = get_current_spotify_user(client)
    playlist = client.playlist(playlist_id)
    snapshot_id = playlist['snapshot_id']
    client.user_playlist_remove_specific_occurences_of_tracks(
        user,
        playlist_id,
        tracks,
        snapshot_id
    )


def create_playlist_from_tracks(client,
                                playlist_name: str,
                                playlist: dict,
                                privacy: str) -> dict:
    if privacy == 'public':
        public = True
    else:
        public = False
    new_playlist = create_empty_playlist(client, playlist_name, public)
    playlist_id = new_playlist['id']
    track_ids = [track['id'] for track in playlist['tracks']]
    add_to_playlist(client, playlist_id, track_ids)
    return new_playlist


def create_empty_playlist(client,
                          playlist_name: str,
                          public: bool = True,
                          description: str = '') -> dict:
    user = get_current_spotify_user(client)
    playlist = client.user_playlist_create(
        user,
        playlist_name,
        public,
        description
    )
    return playlist


def add_to_playlist(client, playlist_id: str, tracks: dict) -> str:
    user = get_current_spotify_user(client)
    snapshot = client.user_playlist_add_tracks(
        user,
        playlist_id,
        tracks
    )
    return snapshot


def get_playlist_recommendations(client,
                                 playlist_id: str,
                                 target_playlist_length: int = 20):
    playlist_df = get_playlist_attributes_df(client, playlist_id)
    seed_tracks = cluster_playlist(playlist_df)
    recommendations = get_recommendations_with_direct_seed(
        client,
        seed_tracks=seed_tracks,
        target_size=target_playlist_length
    )
    recommendations = process_recommendations(recommendations)
    return recommendations


def cluster_playlist(playlist_df):
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


def get_recommendations_with_direct_seed(
    client,
    seed_artists: str = None,
    seed_genres: str = None,
    seed_tracks: str = None,
    target_size: int = 20
):
    recommendations = client.recommendations(
        seed_artists,
        seed_genres,
        seed_tracks,
        target_size
    )
    recommendations = process_recommendations(recommendations)
    return recommendations


def process_recommendations(recommendations: dict) -> dict:
    for track in recommendations['tracks']:
        track['embed_url'] = 'https://open.spotify.com/embed/track/' + track['id']
        artist_names = [artist['name'] for artist in track['artists']]
        track['artist_names'] = ', '.join(artist_names)
    return recommendations


def get_playlist_attributes_df(client, playlist_id: str):
    playlist_tracks = client.playlist_tracks(playlist_id)
    tracks = playlist_tracks['items']
    df_tracks = get_track_init_df(tracks)

    artist_ids = df_tracks['artist_id'].unique().tolist()
    df_artists = get_artists_df(client, artist_ids)

    track_ids = df_tracks['id'].unique().tolist()
    df_features = get_track_features_df(client, track_ids)

    playlist_df = df_features.merge(df_tracks, on='id')
    playlist_df = playlist_df.merge(df_artists, on='artist_id')
    playlist_df['full_name'] = playlist_df['artist_name'] + \
        ' -- ' + playlist_df['song_name']

    playlist_df = playlist_df.set_index('id')
    return playlist_df


def get_track_init_df(tracks: list):
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


def get_artists_df(client, artist_ids: list):
    artist_list = []
    while artist_ids:
        artist_results = client.artists(artist_ids[:API_LIMIT])
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


def get_track_features_df(client, track_ids: list):
    feature_list = []
    while track_ids:
        feature_results = client.audio_features(
            track_ids[:API_LIMIT])
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


def get_recommendations_with_generated_seed(client, artists=None,
                                            tracks=None,
                                            seed_genres=None,
                                            target_size=20):
    if artists:
        top_artists = [
            get_top_artists(client, length, limit)
            for length, limit in artists.items()
        ]
        seed_artists = [
            artist for top_lists in top_artists for artist in top_lists
        ]
    if tracks:
        top_tracks = [
            get_top_tracks(client, length, limit)
            for length, limit in tracks.items()
        ]
        seed_tracks = [
            track for top_lists in top_tracks for track in top_lists
        ]
    recommendations = client.recommendations(
        seed_artists,
        seed_genres,
        seed_tracks,
        target_size
    )
    recommendations = process_recommendations(recommendations)
    return recommendations


def get_top_artists(client, length: str, limit: int) -> list:
    top_artists = client.current_user_top_artists(limit, 0, length)
    top_artist_ids = [artist['id'] for artist in top_artists['items']]
    return top_artist_ids


def get_top_tracks(client, length: str, limit: str) -> list:
    top_tracks = client.current_user_top_tracks(limit, 0, length)
    top_track_ids = [track['id'] for track in top_tracks['items']]
    return top_track_ids


def get_artist_analysis(client, artist_ids: list):
    artists = client.artists(artist_ids)
    artist_ids = [artist['id'] for artist in artists['artists']]
    df_artists = get_artists_df(artist_ids)
    return df_artists


def get_track_analysis(client, track_ids: list):
    tracks = client.tracks(track_ids)
    track_ids = [track['id'] for track in tracks['tracks']]
    df_tracks = get_track_init_df(track_ids)
    df_features = get_track_features_df(track_ids)
    combined_df = df_features.merge(df_tracks, on='id')
    return combined_df


def search(client, query: str, limit: int = 10, search_type: str = 'track'):
    return client.search(
        query,
        limit,
        search_type
    )


def count_genres_from_artists(artists: dict) -> dict:
    genres_count = collections.defaultdict(int)
    for artist in artists['items']:
        genres = artist['genres']
        for genre in genres:
            genres_count[genre] += 1
    return genres_count
