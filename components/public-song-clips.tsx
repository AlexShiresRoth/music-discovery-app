import PreHeader from "@/app/profile/pre-header";
import { SongClip } from "@/lib/db/types";
import WaveSurferUI from "./wave-surfer";

type Props = {
  clips: SongClip[];
};

export default function PublicSongClips({ clips }: Props) {
  const filteredClips = clips.filter((clip) => clip.db_url);
  return (
    <div className="flex flex-col gap-4 w-full">
      <PreHeader>Featured Song Clips</PreHeader>
      <div className="flex flex-col gap-4">
        {filteredClips.map((clip) => {
          return (
            <div key={clip.id}>
              <WaveSurferUI
                url={clip.db_url as string}
                clipName={clip.title || ""}
                fullSongUrl={clip.full_song_url || ""}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
