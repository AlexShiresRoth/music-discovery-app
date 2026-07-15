import { getProfiles } from "@/lib/auth";

export default async function Home() {
  const profiles = await getProfiles();
  const profile = profiles[0];
  const mockProfiles = Array.from({ length: 10 }, (_, i) => ({
    ...profile,
    index: i,
  }));

  return (
    <main className="w-full flex flex-col gap-4 items-center">
      <div className="flex flex-col md:w-3/4 w-full gap-2 snap-y snap-mandatory overflow-y-scroll h-screen">
        {mockProfiles.map((profile) => {
          return (
            <div
              key={profile.index}
              className="flex flex-col snap-start min-h-screen p-8 bg-amber-500 rounded w-full"
            >
              <div className="text-7xl font-bold text-black uppercase">
                {profile.profileName}
              </div>
              <div className="flex gap-2">
                {profile.songClips.map((clip) => {
                  return (
                    <div
                      key={clip.id}
                      className="text-4xl font-bold text-black uppercase"
                    >
                      {clip.slot}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
