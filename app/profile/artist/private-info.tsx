import MembersWithAccess from "../members-with-access";
import { ArtistProfileFormSchemaWithoutId } from "../schemas";
import PreHeader from "./pre-header";

export default function PrivateInfo({
  fullName,
  contactEmail,
  joinedDate,
  membersWithAccess,
}: ArtistProfileFormSchemaWithoutId & {
  membersWithAccess: string[];
  joinedDate: Date | null;
}) {
  const date = new Date(joinedDate || "").toLocaleDateString();
  return (
    <div className="flex flex-col gap-10 w-full border border-gray-400/80 rounded-md p-8">
      <h2 className="font-bold uppercase text-indigo-500">Private Info</h2>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-4 border-b border-gray-400/80 pb-4">
          <div>
            <PreHeader>Full Name</PreHeader>
            <p className="text-lg">{fullName}</p>
          </div>
          <div>
            <PreHeader>Contact Email</PreHeader>
            <p className="text-lg">{contactEmail}</p>
          </div>
          <div>
            <PreHeader>Joined Date</PreHeader>
            <p className="text-lg">{date}</p>
          </div>
        </div>
        <div>
          <PreHeader>Members with Access</PreHeader>
          <MembersWithAccess membersWithAccess={membersWithAccess} />
        </div>
      </div>
    </div>
  );
}
