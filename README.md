# Toolify
### Useful tools for Spotify :v:
___

Neat features:
* View your top artists and songs over different ranges of time
* See info about your top artists
* Visualize the average audio attributes of your playlists
* Get song recommendations based on your playlists (explained further below)
    * Add those recommendations to a new playlist directly from the page

Future features (backend already implemented):
* Check your playlists for duplicate songs
* Copy songs from one playlist to another
* Get recommendations based on your top artists and tracks
## [Try it out!](https://my-toolify.herokuapp.com)
*(You'll need third party cookies enabled, and the first visit might take a bit to load if the Heroku app is idle)*
___

<p align="center">
<img src="./demo/toolify.png" width=700>

<img src="./demo/artists.png" width=600>

<img src="./demo/playlist.png" width=600>

<img src="./demo/recommendation.png" width=600>
</p>

___
## Built with:
* Spotify API
    * Spotipy
* React
    * React Router
    * React Bootstrap
    * Styled Components
    * Recharts
* Flask
    * Flask Dance
* Heroku

___
## Playlist recommendations, via [k-means clustering](https://en.wikipedia.org/wiki/K-means_clustering)

For me, the most fun aspect of this project is the method of recommending songs based on an input playlist. The Spotify API currently only accepts up to 5 seed tracks when generating recommendations, so we need to somehow select 5 songs from a playlist which best represent it if we want to get the most relevant recommendations. Luckily, the Spotify API also provides a ton of useful data, like the audio features of a particular song. By gathering the audio features of each song in the playlist, we can cluster the songs into 5 different groups (this number is both convenient for the API and also supported by the [elbow method](https://en.wikipedia.org/wiki/Elbow_method_(clustering))). Each group will have its own shared set of common audio features which link the songs together. For example, one group of songs in a playlist might have high danceability and energy values, while another group might have high acousticness and instrumentalness values. Then, by taking one song from each cluster, we've found our 5 tracks to provide the Spotify API. You can visualize the process by looking at the graph of audio features on the playlist page, and then the graph of audio features of the selected seed songs on the corresponding recommendations page. Ideally, the 5 seed songs should have audio characteristics which resemble those of the whole playlist, and the graphs should look about the same. 
