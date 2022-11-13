import { useSelector } from "react-redux";
import data from "../data/tracks";
import "./audioLists.scss";

export function getUrl(data8) {
    const content = new Uint8Array(data8.data);
    return URL.createObjectURL(
        new Blob([content.buffer], {
            type: data8.format
        })
    )
}

const AudioLists = () => {
    const { tracks } = useSelector(state => state.tracks);


    return (
        <div className="audioList" style={{ textAlign: "center", margin: "100px 200px" }}>
            <table className="table">
                <thead className="thead">
                    <tr className="tr">
                        <th></th>
                        <th>Name</th>
                        <th>Artist</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map(tracks => (
                        <tr key={tracks.title} className="table__tr">
                            <td>
                                <img
                                    src={tracks.image}
                                    alt="track img"
                                    style={{
                                        width: "50px",
                                        height: "50px",
                                        borderRadius: "100%",
                                    }} />
                            </td>
                            <td>
                                {tracks.title}
                            </td>
                            <td>
                                {tracks.artist}
                            </td>
                        </tr>
                    ))}

                    {tracks.map(value => {
                        return (
                            <tr key={value._id} className="table__tr">
                                <td>
                                    <img
                                        src={getUrl(value.picture)}
                                        alt={value.picture.description}
                                        style={{
                                            width: "50px",
                                            height: "50px",
                                            borderRadius: "100%",
                                        }} />
                                </td>
                                <td>
                                    {value.title}
                                </td>
                                <td>
                                    {value.artistName ? value.artistName : "none"}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

export default AudioLists;