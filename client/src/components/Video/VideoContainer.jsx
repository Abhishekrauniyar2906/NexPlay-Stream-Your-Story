import React, { useRef, useState, useEffect } from "react";
import VideoCard from "./VideoCard";
import { FaVideo } from "react-icons/fa";
import axiosInstance from "../../utils/axios.helper.js";
import InfiniteScroll from "react-infinite-scroll-component";
import { icons } from "../../assets/Icons.jsx";
import Navbar from "../Navbar/Navbar.jsx";

function VideoContainer(){
    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading]= useState(true);
    const [hasMore, setHasmore]= useState(true);
   



    const getData= async(page)=>{
        try{
            const response= await axiosInstance.get(`/videos?page=${page}&limit=20`);
            if(response?.data?.data?.length>0){
                setVideos((prevVideo)=>[
                    ...prevVideo,
                    ...response.data.data,
                ]);
                setLoading(false);
                if(response.data.data.length!==20 ){
                    setHasmore(false);
                }

            }
            else{
                setHasmore(false);
            }
        }
        catch(error){
            console.log("error fetching videos", error);
        }
    }

   
      

    useEffect(()=>{
        getData(page);
    },[page]);

    const fetchMoreData= ()=>{
        setPage((prevPage)=> prevPage+1);
    };

    if(loading){
        return (<span className="flex justify-center mt-20">{icons.bigLoading}</span>);
    }

    if (videos.length === 0) {
        return (
            <div className="flex justify-center mt-[30vh]">
                <div className="flex flex-col items-center">
                    <FaVideo className="w-33 h-33" />
                    <h1 className="text-3xl">No Videos Available</h1>
                </div>
            </div>
        );
    }

  //   const chunkSize = 6; // using 6 video slots per layout
  // const gridChunks = [];

  // for (let i = 0; i < videos.length; i += chunkSize) {
  //   gridChunks.push(videos.slice(i, i + chunkSize));
  // }


  const chunkSize = 6;
  const chunks = [];

  for (let i = 0; i < videos.length; i += chunkSize) {
    chunks.push(videos.slice(i, i + chunkSize));
  }
      

    return (
<>
<Navbar/>


      
        <div className="w-full h-full overflow-auto pr-1 flex gap-5">
        <InfiniteScroll
            dataLength={videos.length}
            next={fetchMoreData}
            hasMore={hasMore}
            loader={
                <div className="flex justify-center h-7 mt-1">
                    {icons.loading}
                </div>
            }
            scrollableTarget="scrollableDiv"
        >
            {/* <div className="overflow-hidden  mb-2 mx-2">
                <div 
                    className={`grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-2 ${
                        videos.length < 4 &&
                        "sm:grid-cols-[repeat(auto-fit,_minmax(300px,0.34fr))] 2xl:grid-cols-[repeat(auto-fit,_minmax(300px,0.24fr))]"
                    }`}
                >
                    {videos.map((video) => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </div>
            </div> */}


             {/* <div className="flex flex-col gap-8">
      {gridChunks.map((chunk, chunkIndex) => (
        <div
          key={chunkIndex}
          className="grid bg-black grid-cols-4 grid-rows-3 gap-2"
        >
          {chunk[0] && (
            <div className="col-span-2 row-span-2 shadow rounded overflow-hidden">
              <VideoCard video={chunk[0]} />
            </div>
          )}
          {chunk[1] && (
            <div className="col-start-3 shadow rounded overflow-hidden">
              <VideoCard video={chunk[1]} />
            </div>
          )}
          {chunk[2] && (
            <div className="col-start-4 shadow rounded overflow-hidden">
              <VideoCard video={chunk[2]} />
            </div>
          )}
          {chunk[3] && (
            <div className="col-start-1 row-start-3 shadow rounded overflow-hidden">
              <VideoCard video={chunk[3]} />
            </div>
          )}
          {chunk[4] && (
            <div className="col-start-2 row-start-3 shadow rounded overflow-hidden">
              <VideoCard video={chunk[4]} />
            </div>
          )}
          {chunk[5] && (
            <div className="col-start-3 row-start-2 col-span-2 row-span-2 shadow rounded overflow-hidden">
              <VideoCard video={chunk[5]} />
            </div>
          )}
        </div>
      ))}
            </div> */}


<div className="flex flex-col  gap-8">
      {chunks.map((group, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="flex flex-col gap-4">
            {/* Row 1: Big Video */}
            {group[0] && (
              <div className="min-h-[200px] w-full ">
                <VideoCard video={group[0]} />
              </div>
            )}
            {/* Row 2: Two Small Videos */}
            <div className="flex gap-4">
              {group[1] && (
                <div className="flex-1 min-h-[120px] ">
                  <VideoCard video={group[1]} />
                </div>
              )}
              {group[2] && (
                <div className="flex-1 min-h-[120px] ">
                  <VideoCard video={group[2]} />
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4">
            {/* Row 1: Two Small Videos */}
            <div className="flex gap-4">
              {group[3] && (
                <div className="flex-1 min-h-[120px] ">
                  <VideoCard video={group[3]} />
                </div>
              )}
              {group[4] && (
                <div className="flex-1 min-h-[120px] ">
                  <VideoCard video={group[4]} />
                </div>
              )}
            </div>
            {/* Row 2: Big Video */}
            {group[5] && (
              <div className="min-h-[200px] w-full ">
                <VideoCard video={group[5]} />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
 


            
        </InfiniteScroll>
    </div></>
);}


export default VideoContainer;