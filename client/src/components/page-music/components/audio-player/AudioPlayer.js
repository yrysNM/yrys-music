import { useState, useEffect, useRef } from "react"
import { useSelector, useDispatch } from "react-redux";
import { songsFetched, songsFetching, tracksDataFetched } from "../../../../actions";
import { getUrl } from "../audio-lists/AudioLists";
import AudioControls from "../audio-controls/AudioControls";
import Spinner from "../../../spinner/Spinner";
import ErrorMessage from "../../../error-message/ErrorMessage";

import "./audioPlayer.scss";

const AudioPlayer = () => {
    const [trackIndex, setTrackIndex] = useState(0);
    const [trackProgress, setTrackProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [durationTrack, setDurationTrack] = useState("");

    const dispatch = useDispatch();

    const { tracks } = useSelector(state => state.tracks);
    const { songsLoadingStatus } = useSelector(state => state.songs);

    const { trackId, title, artistName, year, picture } = tracks[trackIndex];

    const audioRef = useRef(new Audio(`http://localhost:4000/tracks/${trackId}`));
    const intervalRef = useRef();
    const isReady = useRef(false);

    const currentPercentage = durationTrack ? `${(trackProgress / durationTrack) * 100}%` : '0%';
    const trackStyling = `-webkit-gradient(linear, 0% 0%, 100% 0%, color-stop(${currentPercentage}, #fff), color-stop(${currentPercentage}, #777))
    `;

    function startTimer() {
        clearInterval(intervalRef.current);

        intervalRef.current = setInterval(() => {
            if (audioRef.current.ended) {
                toNextTrack();
            } else {
                setTrackProgress(audioRef.current.currentTime);
            }
        }, [1000]);
    }


    const onScrub = (value) => {
        // Clear any timers already running
        clearInterval(intervalRef.current);
        audioRef.current.currentTime = value;
        setTrackProgress(audioRef.current.currentTime);
    }

    const onScrubEnd = () => {
        // If not already playing, start
        if (!isPlaying) {
            setIsPlaying(true);
        }
        startTimer();
    }

    const toPrevTrack = () => {
        if (trackIndex - 1 < 0) {
            setTrackIndex(tracks.length - 1);
        } else {
            setTrackIndex(trackIndex - 1);
        }
    }

    const toNextTrack = () => {
        if (trackIndex < tracks.length - 1) {
            setTrackIndex(trackIndex + 1);
        } else {
            setTrackIndex(0);
        }
    }

    const initialTrack = () => {
        const _url = `http://localhost:4000/tracks/${trackId}`;
        audioRef.current.pause();

        audioRef.current = new Audio(_url);
        audioRef.current.setAttribute("type", "audio/mp3");
        audioRef.current.setAttribute("codecs", "mp3");
        audioRef.current.setAttribute("preload", "metadata");

        audioRef.current.load();

        setTrackProgress(audioRef.current.currentTime);
        dispatch(songsFetching());

        getDuration(_url, function (duration) {

            setDurationTrack(duration);
            dispatch(songsFetched());

        });


    }

    function getDuration(url, next) {
        let _player = new Audio(url);
        _player.addEventListener("durationchange", function (e) {
            if (this.duration !== Infinity) {
                let duration = this.duration;
                _player.remove();
                next(duration);
            };
        }, false);

        _player.load();
        _player.currentTime = 24 * 60 * 60;
        _player.volume = 0;
    }

    useEffect(() => {
        if (isPlaying) {
            audioRef.current.play();
            startTimer();
        } else {
            audioRef.current.pause();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying]);

    useEffect(() => {
        if (audioRef.current.paused) {
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
        }
    }, [audioRef.current.paused])

    useEffect(() => {
        dispatch(tracksDataFetched({
            id: trackId,
            artistName: artistName,
            title: title,
        }));

        initialTrack();

        if (isReady.current && audioRef.current && durationTrack.length > 0 && isPlaying) {
            audioRef.current.play();
            setIsPlaying(true);
            startTimer();
        } else {
            isReady.current = true;
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trackIndex]);

    useEffect(() => {

        return () => {
            audioRef.current.pause();
            clearInterval(intervalRef.current);
        }
    }, []);




    return (
        <RenderAudioPlayer data={
            {
                songsLoadingStatus,
                title,
                artistName,
                picture,
                year,
                isPlaying,
                trackStyling,
                trackProgress,
                durationTrack,
                toPrevTrack,
                toNextTrack,
                setIsPlaying,
                onScrubEnd,
                onScrub,

            }
        } />
    );
}

const RenderAudioPlayer = ({ data }) => {
    if (data.songsLoadingStatus === "loading") {
        return <Spinner />
    } else if (data.songsLoadingStatus === "error") {
        return <ErrorMessage />
    }

    return (
        <div className="audio-player">
            <div className="track-info">
                <img
                    className="artwork"
                    src={getUrl(data.picture)}
                    alt={data.picture.description}
                />
                <h2 className="audio-title">{`Title - ${data.title}`}</h2>
                <h3 className="audio-artist">{`Artist - ${data.artistName}`}</h3>
                <div className="audio-info">
                    <p>{`Year - ${data.year}`}</p>
                </div>
                <AudioControls
                    isPlaying={data.isPlaying}
                    onPrevClick={data.toPrevTrack}
                    onNextClick={data.toNextTrack}
                    onPlayPauseClick={data.setIsPlaying} />

                <input type="range"
                    value={data.trackProgress}
                    step="1"
                    min="0"
                    max={data.durationTrack ? data.durationTrack : `${data.durationTrack}`}
                    className="progess"
                    onChange={(e) => data.onScrub(e.target.value)}
                    onMouseUp={data.onScrubEnd}
                    onKeyUp={data.onScrubEnd}
                    style={{ background: data.trackStyling }} />

                <div className="audio-duration">
                    {data.durationTrack}
                </div>
            </div>
        </div>
    );
}

export default AudioPlayer;