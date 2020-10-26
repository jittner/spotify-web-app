import requests
import json
import spotipy
import yaml
import typing
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
import urllib
from urllib.parse import urlencode
import time
import webbrowser
from functools import wraps


API_KEY_FILE = 'auth.yaml'
API_LIMIT = 50


class User():
    '''
    This class is responsible for authorizing the user, by following the
    OAuth2 flow to fetch necessary tokens from Spotify. The refresh process
    is initiated as needed when the token expires. The token is used to
    interact with the Spotify API via spotipy client.
    '''
    AUTHORIZE_URL = 'https://accounts.spotify.com/authorize'
    TOKEN_URL = 'https://accounts.spotify.com/api/token'

    def __init__(self):
        self.__scope = 'user-library-read playlist-modify-private user-top-read'
        self.__redirect = 'http://localhost:5000/callback'
        self.__client_id, self.__client_secret = self.__get_credentials()
        self.__access_token = None
        self.__refresh_token = None
        self.__token_expiry = None
        self.__client = None

    @update_spotipy_client
    def get_client(self):
        return self.__client

    def open_auth_url(self):
        auth_url = self.__get_auth_url()
        webbrowser.open(auth_url)

    def get_access_token(self, code):
        payload = {
            'redirect_uri': self.__redirect,
            'code': code,
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
        self.__client = spotipy.Spotify(auth=self.__access_token)

    def __get_credentials(self):
        with open(API_KEY_FILE, 'r') as config_file:
            config = yaml.load(config_file, Loader=yaml.FullLoader)
        return(config['spotify']['client_id'], config['spotify']['client_secret'])

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

    def update_spotipy_client(func):
        @wraps(func)
        def wrapper(self, *args, **kwargs):
            if not self.__is_token_valid():
                self.__refresh_access_token(self.__refresh_token)
                self.__client = spotipy.Spotify(auth=self.__access_token)
            return func(self, *args, **kwargs)
        return wrapper

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
