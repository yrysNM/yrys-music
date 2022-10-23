import { useState, useEffect, useRef } from "react"
import AudioControls from "../audio-controls/AudioControls";
import "./audioPlayer.scss";
import data from "../data/tracks";

const AudioPlayer = ({ tracks, musicData = data }) => {
    const [trackIndex, setTrackIndex] = useState(0);
    const [trackProgress, setTrackProgress] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [base64Track, setBase64Track] = useState("");

    // if (musicData[trackIndex]) {
    //     var tracksData = musicData[trackIndex];
    //     console.log(convertBinToBase64(tracksData.tracksData));

    // }
    const { title, artist, image, audioSrc, tracksData } = tracks[trackIndex];
    const audioRef = useRef(new Audio("http://localhost:4000/tracks/6349befcfde82ff8b0227f16"));
    const intervalRef = useRef();
    const isReady = useRef(false);
    const { duration } = audioRef.current;

    const currentPercentage = duration ? `${(trackProgress / duration) * 100}%` : '0%';
    const trackStyling = `-webkit-gradient(linear, 0% 0%, 100% 0%, color-stop(${currentPercentage}, #fff), color-stop(${currentPercentage}, #777))
`;
    useEffect(() => {
        convertBinToBase64(tracksData)
    }, [trackIndex]);
    async function convertBinToBase64(tracksData) {
        // const convertBinToBase = btoa(escape(encodeURIComponent(tracksData[0].data)));
        const base64Music = `data:audio/mp3;base64,${tracksData[0].data}`;
        const base64Response = await fetch(base64Music);
        const blob = await base64Response.blob();
        setBase64Track(blob);

    }

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



    useEffect(() => {
        if (isPlaying) {
            if (audioRef.current.play) {
                audioRef.current.play();
                startTimer();
            }

        } else {
            // clearInterval(intervalRef.current);
            audioRef.current.pause();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying]);


    useEffect(() => {
        audioRef.current.pause();


        audioRef.current = new Audio("http://localhost:4000/tracks/6349befcfde82ff8b0227f16");
        console.log(audioRef);
        setTrackProgress(audioRef.current.currentTime);

        if (isReady.current) {
            audioRef.current.play();
            setIsPlaying(true);
            startTimer();
        } else {
            isReady.current = true;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trackIndex]);

    useEffect(() => {
        setIsPlaying(!audioRef.current.paused);
    }, [audioRef.current.paused])


    useEffect(() => {
        return () => {
            audioRef.current.pause();
            clearInterval(intervalRef.current);
        }
    }, []);



    return (
        <div className="audio-player">
            <div className="track-info">
                <img
                    className="artwork"
                    src={image}
                    alt={`track artwork for ${title} by ${artist}`}
                />
                <h2 className="audio-title">{title}</h2>
                <h3 className="audio-artist">{artist || "none"}</h3>
                <AudioControls
                    isPlaying={isPlaying}
                    onPrevClick={toPrevTrack}
                    onNextClick={toNextTrack}
                    onPlayPauseClick={setIsPlaying} />

                <input type="range"
                    value={trackProgress}
                    step="1"
                    min="0"
                    max={duration ? duration : `${duration}`}
                    className="progess"
                    onChange={(e) => onScrub(e.target.value)}
                    onMouseUp={onScrubEnd}
                    onKeyUp={onScrubEnd}
                    style={{ background: trackStyling }} />
            </div>
        </div>
    );
}

export default AudioPlayer;