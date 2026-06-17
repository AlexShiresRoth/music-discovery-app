import { getSession } from "@/lib/auth";

type Props = {
  membersWithAccess: string[];
};

// TODO - how can we get other members by id?
export default async function MembersWithAccess({ membersWithAccess }: Props) {
  const session = await getSession();

  return (
    <div>
      {membersWithAccess.map((member) => {
        return (
          <div key={member}>{session?.user.id === member ? "Me" : member}</div>
        );
      })}
    </div>
  );
}
