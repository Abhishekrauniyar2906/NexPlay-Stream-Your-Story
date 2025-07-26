import React from 'react';

const VideoPlayer = ({videoFile})=>{
    return (
        <video controls autoPlay className='rounded-xl w-full max-h-[70vh]'>
            <source src ={videoFile} type="video/mp4"/>
        </video>
    )

};

export default VideoPlayer