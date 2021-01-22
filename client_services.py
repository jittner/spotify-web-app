import collections
import typing
from functools import wraps
from typing import Dict, List, Set, Tuple

import numpy as np
import pandas as pd
import spotipy
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

API_LIMIT = 50


def get_spotipy_client(func):
    @wraps(func)
    def wrapper(token, *args, **kwargs):
        client = spotipy.Spotify(auth=token)
        return func(client, *args, **kwargs)
    return wrapper


@get_spotipy_client
def get_user_homepage_info(client) -> dict:
    user_profile = client.current_user()
    top_artists = client.current_user_top_artists(20, 0, 'long_term')
    top_tracks = client.current_user_top_tracks(20, 0, 'long_term')
    homepage_info = {
        'followers': user_profile['followers']['total'],
        'image': user_profile['images'][0]['url'],
        'name': user_profile['display_name'],
        'top_artists': top_artists['items'],
        'top_tracks': top_tracks['items']
    }
    return homepage_info


@get_spotipy_client
def get_user_playlists(client) -> List[dict]:
    playlists = []
    paging_object = client.current_user_playlists()
    while paging_object:
        for playlist in paging_object['items']:
            if int(playlist['tracks']['total']) > 0:
                playlists.append(playlist)
        if paging_object['next']:
            paging_object = client.next(paging_object)
        else:
            paging_object = None
    return playlists


@get_spotipy_client
def copy_playlist(client, first_playlist_id: str, second_playlist_id: str):
    username = get_current_spotify_user(client)
    first_playlist = get_tracks_from_playlist(client, first_playlist_id)
    playlist_tracks = first_playlist['items']
    tracks_to_add = [track['track']['id'] for track in playlist_tracks]
    client.user_playlist_add_tracks(
        username,
        second_playlist_id,
        tracks_to_add
    )


def get_tracks_from_playlist(client, playlist_id: str, paging_object=None) -> List[dict]:
    """
    Get the complete list of tracks from a playlist paging object.
    If the paging object for the playlist isn't already provided,
    retrieve it via Spotipy.
    """
    tracks = []
    if not paging_object:
        paging_object = client.playlist_tracks(playlist_id)
    while paging_object:
        tracks.extend(paging_object['items'])
        if paging_object['next']:
            paging_object = client.next(paging_object)
        else:
            paging_object = None
    return tracks


def get_current_spotify_user(client):
    user_spotify = client.current_user()
    username = user_spotify['id']
    return username


@get_spotipy_client
def find_duplicate_songs(client, playlist_id: str) -> Tuple[dict, dict]:
    """
    Determine which tracks in a playlist are exact duplicates (based on
    identical track IDs) or possible duplicates (matching artists and
    track names, but different track IDs).
    """
    tracks = get_tracks_from_playlist(client, playlist_id)
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


@get_spotipy_client
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


@get_spotipy_client
def create_playlist_from_tracks(client,
                                playlist_name: str,
                                playlist_tracks: list,
                                privacy: str) -> dict:
    """
    Create a new playlist for the current user,
    given a list of track ids. Returns the new playlist object.
    """
    if privacy == 'public':
        public = True
    else:
        public = False
    new_playlist = create_empty_playlist(client, playlist_name, public)
    playlist_id = new_playlist['id']
    add_to_playlist(client, playlist_id, playlist_tracks)
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


def add_to_playlist(client, playlist_id: str, tracks: list) -> str:
    user = get_current_spotify_user(client)
    snapshot = client.user_playlist_add_tracks(
        user,
        playlist_id,
        tracks
    )
    return snapshot


@get_spotipy_client
def get_playlist_recommendations(client,
                                 playlist_id: str,
                                 target_length: int = 0) -> dict:
    """
    Generate recommended tracks based on a seed playlist, by clustering
    the playlist tracks into 5 groups and selecting 1 track from each
    to be used as seeds for the Spotify API.

    Returns:
        Dict containing:
        - recommendations: dict with the recommended track objects
        - seedAttributes: list of dicts containing the audio features of the
        seed tracks used to generate the recommendations
    """
    seed_playlist = client.playlist(playlist_id)
    seed_playlist_tracks = get_tracks_from_playlist(
        client, seed_playlist, seed_playlist['tracks'])
    if not target_length:
        target_length = select_target_length(len(seed_playlist_tracks))
    playlist_df = get_playlist_attributes_df(
        client, playlist_id, seed_playlist_tracks)
    seed_tracks, seed_attributes = cluster_playlist(playlist_df)
    recommendations = client.recommendations(
        seed_tracks=seed_tracks,
        limit=target_length
    )
    recommendations['tracks'] = remove_playlist_track_overlaps(
        seed_playlist_tracks, recommendations['tracks'])
    recommendations = get_full_tracks_for_recommendations(
        client, recommendations)
    response = {
        'recommendations': recommendations,
        'seedAttributes': seed_attributes
    }
    return response


def select_target_length(seed_length: int) -> int:
    if 0 <= seed_length < 25:
        return 20
    elif 25 <= seed_length < 40:
        return 35
    elif 40 <= seed_length < 70:
        return 60
    else:
        return 100


def remove_playlist_track_overlaps(first_playlist: list,
                                   second_playlist: list) -> List[dict]:
    """
    Remove tracks from a recommendation playlist which
    occur in the seed playlist.

    Args:
        - first_playlist: The list of tracks from the seed playlist
        - second_playlist: The list of simplified track objects from the
        recommendation playlist
    """
    first_playlist_ids = set([track['track']['id']
                              for track in first_playlist])
    processed_playlist = [
        track for track in second_playlist
        if track['id'] not in first_playlist_ids
    ]
    return processed_playlist


def cluster_playlist(playlist_df) -> Tuple[List[str], List[dict]]:
    """
    Use k-means clustering to group tracks into a target of 5
    clusters based on audio attributes, and then
    select 1 random song from each.

    Args:
        - playlist_df: DataFrame containing tracks and their attributes

    Returns:
        Tuple containing:
        - seed_songs: List of track IDs representing the chosen tracks
        - seed_attributes: List of attributes of the chosen tracks,
        formatted to be easily parsed into a Recharts component
    """
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
    seed_songs_df = playlist_df.loc[seed_songs, :]
    seed_attributes = format_attributes_from_df(seed_songs_df)
    return (seed_songs, seed_attributes)


def format_attributes_from_df(tracks_df, data_id='1') -> List[dict]:
    """
    Get the average audio features of a list of tracks from
    a DataFrame, and return them in a format to be easily parsed
    by Recharts

    Args: 
        - tracks_df: DataFrame containing tracks and their attributes
        - data_id: str to be used as the dataKey for a Recharts component
    """
    attributes = [
        {'attribute': 'acousticness',
            data_id: tracks_df['acousticness'].mean()},
        {'attribute': 'danceability',
            data_id: tracks_df['danceability'].mean()},
        {'attribute': 'energy', data_id: tracks_df['energy'].mean()},
        {'attribute': 'instrumentalness',
            data_id: tracks_df['instrumentalness'].mean()},
        {'attribute': 'liveness', data_id: tracks_df['liveness'].mean()},
        {'attribute': 'speechiness', data_id: tracks_df['speechiness'].mean()},
        {'attribute': 'valence', data_id: tracks_df['valence'].mean()},
    ]
    return attributes


@get_spotipy_client
def get_recommendations_with_direct_seed(client,
                                         seed_artists: str = None,
                                         seed_genres: str = None,
                                         seed_tracks: str = None,
                                         target_size: int = 20) -> dict:
    recommendations = client.recommendations(
        seed_artists,
        seed_genres,
        seed_tracks,
        target_size
    )
    recommendations = get_full_tracks_for_recommendations(
        client, recommendations)
    return recommendations


def get_full_tracks_for_recommendations(client, recommendations: dict) -> dict:
    """
    Retrieve the full track object for each simplified track
    within the given recommendation object.
    """
    seed_tracks = [client.track(seed['id'])
                   for seed in recommendations['seeds']]
    recommendation_tracks = [client.track(track['id'])
                             for track in recommendations['tracks']]
    recommendations['tracks'] = recommendation_tracks
    recommendations['seeds'] = seed_tracks
    return recommendations


def process_recommendations(recommendations: dict) -> dict:
    """
    Create the url for an embedded Spotify track player for
    each track in the list of recommendations, and format the artist
    names to be one string.
    """
    for track in recommendations['tracks']:
        track['embed_url'] = 'https://open.spotify.com/embed/track/' + track['id']
        artist_names = [artist['name'] for artist in track['artists']]
        track['artist_names'] = ', '.join(artist_names)
    return recommendations


@get_spotipy_client
def get_playlist_analysis(client, playlist_id: str) -> dict:
    """
    Retrieve basic info about a playlist as well as the
    averaged audio attributes of its tracks.
    """
    playlist = client.playlist(playlist_id)
    playlist_tracks = get_tracks_from_playlist(
        client, playlist, playlist['tracks'])
    playlist_df = get_playlist_attributes_df(
        client, playlist_id, playlist_tracks)
    playlist_attributes = format_attributes_from_df(playlist_df)
    return {
        'attributes': playlist_attributes,
        'tracks': playlist_tracks,
        'length': playlist['tracks']['total'],
        'info': {
            'description': playlist['description'],
            'external_urls': playlist['external_urls'],
            'images': playlist['images'],
            'name': playlist['name'],
            'owner': playlist['owner'],
            'id': playlist['id']
        }
    }


def get_playlist_attributes_df(client, playlist_id: str, tracks=None):
    """
    Create a complete aggregate DataFrame of the audio features from
    a given playlist's tracks.
    """
    if not tracks:
        tracks = get_tracks_from_playlist(client, playlist_id)
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
    """Create the skeleton DataFrame for a given list of tracks."""
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


def get_artists_df(client, artist_ids: List[str]):
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


@get_spotipy_client
def get_recommendations_with_generated_seed(client, artists=None,
                                            tracks=None,
                                            seed_genres=None,
                                            target_size=20) -> dict:
    if artists:
        top_artists = [
            get_top_artists_ids(client, length, limit)
            for length, limit in artists.items()
        ]
        seed_artists = [
            artist for top_lists in top_artists for artist in top_lists
        ]
    if tracks:
        top_tracks = [
            get_top_tracks_ids(client, length, limit)
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
    recommendations = get_full_tracks_for_recommendations(
        client, recommendations)
    return recommendations


@get_spotipy_client
def get_top_artists_ids(client, length: str, limit: str) -> List[str]:
    top_artists = client.current_user_top_artists(limit, 0, length)
    top_artist_ids = [artist['id'] for artist in top_artists['items']]
    return top_artist_ids


@get_spotipy_client
def get_top_tracks_ids(client, length: str, limit: str) -> List[str]:
    top_tracks = client.current_user_top_tracks(limit, 0, length)
    top_track_ids = [track['id'] for track in top_tracks['items']]
    return top_track_ids


@get_spotipy_client
def get_top_artists(client, length: str, limit=50) -> List[dict]:
    artists = []
    paging_object = client.current_user_top_artists(
        limit=limit, time_range=length)
    while paging_object:
        artists.extend(paging_object['items'])
        if paging_object['next']:
            paging_object = client.next(paging_object)
        else:
            paging_object = None
    return artists


@get_spotipy_client
def get_top_tracks(client, length: str, limit=50) -> List[dict]:
    tracks = []
    paging_object = client.current_user_top_tracks(
        limit=limit, time_range=length)
    while paging_object:
        tracks.extend(paging_object['items'])
        if paging_object['next']:
            paging_object = client.next(paging_object)
        else:
            paging_object = None
    return tracks


@get_spotipy_client
def get_artist_analysis(client, artist_ids: list):
    artists = client.artists(artist_ids)
    artist_ids = [artist['id'] for artist in artists['artists']]
    df_artists = get_artists_df(client, artist_ids)
    return df_artists


@get_spotipy_client
def get_track_analysis(client, track_ids: list):
    tracks = client.tracks(track_ids)
    track_ids = [track['id'] for track in tracks['tracks']]
    df_tracks = get_track_init_df(track_ids)
    df_features = get_track_features_df(client, track_ids)
    combined_df = df_features.merge(df_tracks, on='id')
    return combined_df


@get_spotipy_client
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
